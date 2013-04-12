/*
 * identity.js: Identity for openstack authentication
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var _ = require('underscore'),
  fs = require('fs'),
  request = require('request'),
  ServiceCatalog = require('./serviceCatalog').ServiceCatalog,
  svcCat = require('./serviceCatalog'),
  url = require('url'),
  util = require('util');

/**
 * exports.createIdentity
 *
 * @description static factory method for creating an authenticated identity
 *
 * @param {object}    options   the options for the identity
 * @param {Function}  callback
 */
exports.createIdentity = function(options, callback) {

  if (typeof(options) === 'function') {
    throw new Error('options is a required argument');
  }
  else if (!options) {
    options = {};
  }

  var id;

  if (options.identity instanceof Identity) {
    id = options.identity;
  }
  else {
    id = new Identity(options);
  }

  id.authorize(options, function(err) {
    if (err) {
      callback(err);
      return;
    }

    callback(err, id);
  });
};

/**
 * Identity object
 *
 * @description Base Identity object for Openstack Keystone
 *
 * @param options
 * @constructor
 */
var Identity = function(options) {
  var self = this;

  self.options = options || {};
  self.name = 'OpenstackIdentity';

  _.each(['url', 'region'], function(value) {
    if (!self.options[value]) {
      throw new Error('options.' + value + ' is a required option');
    }
  });
};

/**
 * Identity.authorize
 *
 * @description this function is the guts of authorizing against an openstack
 * identity endpoint.
 * @param {object}  options   the options for authorization
 * @param callback
 */
Identity.prototype.authorize = function(options, callback) {
  var self = this;

  if (typeof(options) === 'function') {
    callback = options;
    options = {};
  }

  var authenticationOptions = {
    uri: url.resolve(options.url || self.options.url, '/v2.0/tokens'),
    method: 'POST'
  };

  self._buildAuthenticationPayload();

  // we can't be called without a payload
  if (!self._authenticationPayload) {
    process.nextTick(function() {
      callback({
        message: 'Unable to authorize; missing required inputs'
      });
    });
    return;
  }

  // Are we filtering down by a tenant?
  if (self.options.tenantId) {
    self._authenticationPayload.auth.tenantId = self.options.tenantId;
  }
  else if (self.options.tenantName) {
    self._authenticationPayload.auth.tenantName = self.options.tenantName;
  }

  authenticationOptions.json = self._authenticationPayload;

  // Don't keep a copy of the credentials in memory
  delete self._authenticationPayload;

  request(authenticationOptions, function(err, response, body) {
    if (err || response.statusCode !== 200) {
      callback(err || new Error('Invalid response code: ' + response.statusCode));
      return;
    }

    // If we don't have a tenantId in the response (meaning no service catalog)
    // go ahead and make a 1-off request to get a tenant and then reauthorize
    if (!body.access.token.tenant) {
      getTenantId(url.resolve(options.url || self.options.url, '/v2.0/tenants'),
        body.access.token.id);
    }
    else {
      self._parseIdentityResponse(body, callback);
    }
  });

  function getTenantId(endpoint, token) {

    var tenantOptions = {
      uri: endpoint,
      json: true,
      headers: {
        'X-Auth-Token': token,
        'Content-Type': 'application/json'
      }
    };

    request(tenantOptions, function(err, response, body) {
      if (err || !body.tenants) {
        callback(new Error('Unable to find tenants'));
        return;
      }

      // TODO make this more resiliant (disabled, etc)
      self.options.tenantId = body.tenants[0].id;

      self.authorize(options, callback);
    });
  }
};

/**
 * Identity._buildAuthenticationPayload
 *
 * @description processes the authentication options into a valid payload for
 * authorization
 *
 * @private
 */
Identity.prototype._buildAuthenticationPayload = function() {
  var self = this;

  // setup our inputs for authorization
  if (self.options.password && self.options.username) {
    self._authenticationPayload = {
      auth: {
        passwordCredentials: {
          username: self.options.username,
          password: self.options.password
        }
      }
    };
  }
  // Token and tenant are also valid inputs
  else if (self.options.token && (self.options.tenantId || self.options.tenantName)) {
    self._authenticationPayload = {
      auth: {
        token: {
          id: self.options.token
        }
      }
    };
  }
};

/**
 * Identity._parseIdentityResponse
 *
 * @description takes the full identity response and deserializes it into a
 * serviceCatalog object with services.
 *
 * @param {object}    data      the raw response from the identity call
 * @param {Function}  callback
 * @private
 */
Identity.prototype._parseIdentityResponse = function(data, callback) {
  var self = this;

  // We validate the serviceCatalog to ensure we don't have a mismatch for the
  // region you've asked for. The ServiceCatalog constructor throws if a region/service
  // match aren't found
  svcCat.validateServiceCatalog(self.options.region, data.access.serviceCatalog, function(err) {
    if (err) {
      callback(err);
      return;
    }

    if (data.access.token) {
      self.token = data.access.token;
      self.token.expires = new Date(self.token.expires);
    }

    if (data.access.serviceCatalog) {
      self.serviceCatalog = new ServiceCatalog(self.options.region, data.access.serviceCatalog);
    }

    self.user = data.access.user;
    self.raw = data;

    callback(err, self);
  });
};

exports.Identity = Identity;
