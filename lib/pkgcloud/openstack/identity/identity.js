/*
 * identity.js: Identity for openstack authentication
 *
 * (C) 2013 Rackspace, Ken Perkins
 * MIT LICENSE
 *
 */

var _ = require('underscore'),
    fs = require('fs'),
    request = require('request'),
    ServiceCatalog = require('./serviceCatalog').ServiceCatalog,
    svcCat = require('./serviceCatalog'),
    url = require('url'),
    urlJoin = require('url-join'),
    util = require('util'),
    pkgcloud = require('../../../pkgcloud'),
    errs = require('errs');

// TODO refactor failCodes, getError into global handlers
var failCodes = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Resize not allowed',
  404: 'Item not found',
  405: 'Bad Method',
  409: 'Build in progress',
  413: 'Over Limit',
  415: 'Bad Media Type',
  500: 'Fault',
  503: 'Service Unavailable'
};

/**
 * exports.createIdentity
 *
 * @description static factory method for creating an authenticated identity
 *
 * @param {object}    options   the options for the identity
 * @param {Function}  callback
 */
exports.createIdentity = function (options, callback) {
  var id;

  if (!options || typeof options !== 'object') {
    throw new Error('options is a required argument');
  }
  else if (!callback || typeof callback !== 'function') {
    throw new Error('callback is a required argument');
  }

  if (options.identity instanceof Identity) {
    id = options.identity;
  }
  else if (options.identity) {
    throw new Error('options.identity must be an Identity if provided');
  }
  else {
    id = new Identity(options);
  }

  id.authorize(options, function (err) {
    return err ? callback(err) : callback(err, id);
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
var Identity = exports.Identity = function (options) {
  var self = this;

  self.options = options || {};
  self.name = 'OpenstackIdentity';

  _.each(['url'], function (value) {
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
Identity.prototype.authorize = function (options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var authenticationOptions = {
    uri: urlJoin(options.url || self.options.url, '/v2.0/tokens'),
    method: 'POST',
    headers: {
      'User-Agent': util.format('nodejs-pkgcloud/%s', pkgcloud.version)
    }
  };

  self._buildAuthenticationPayload();

  // we can't be called without a payload
  if (!self._authenticationPayload) {
    return process.nextTick(function () {
      callback(new Error('Unable to authorize; missing required inputs'));
    });
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

  request(authenticationOptions, function (err, response, body) {
    // check for a network error, or a handled error
    var err2 = getError(err, response, body);

    if (err2) {
      return callback(err2);
    }

    // If we don't have a tenantId in the response (meaning no service catalog)
    // go ahead and make a 1-off request to get a tenant and then reauthorize
    if (!body.access.token.tenant) {
      getTenantId(urlJoin(options.url || self.options.url, '/v2.0/tenants'), body.access.token.id);
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
        'Content-Type': 'application/json',
        'User-Agent': util.format('nodejs-pkgcloud/%s', pkgcloud.version)
      }
    };

    request(tenantOptions, function (err, response, body) {
      if (err || !body.tenants || !body.tenants.length) {
        return callback(err ? err : new Error('Unable to find tenants'));
      }

      var firstActiveTenant;
      body.tenants.forEach(function (tenant) {
        if (!firstActiveTenant && !!tenant.enabled && tenant.enabled !== 'false') {
          firstActiveTenant = tenant;
        }
      });

      if (!firstActiveTenant) {
        return callback(new Error('Unable to find an active tenant'));
      }

      // TODO make this more resiliant (what if multiple active tenants)
      self.options.tenantId = firstActiveTenant.id;
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
Identity.prototype._buildAuthenticationPayload = function () {
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
Identity.prototype._parseIdentityResponse = function (data, callback) {
  var self = this;

  if (!data || !callback) {
    return callback(new Error('missing required arguments!'));
  }

  // Data integrity check, make sure we got the right user back
  if (self.options.username !== data.access.user.name) {
    return callback(new Error('Username did not match provided username!'));
  }

  // We validate the serviceCatalog to ensure we don't have a mismatch for the
  // region you've asked for. The ServiceCatalog constructor throws if a region/service
  // match aren't found
  svcCat.validateServiceCatalog(self.options.region, data.access.serviceCatalog, function (err) {
    if (err) {
      return callback(err);
    }

    if (data.access.token) {
      self.token = data.access.token;
      self.token.expires = new Date(self.token.expires);
    }

    if (data.access.serviceCatalog) {
      self.serviceCatalog = new ServiceCatalog(self.options.region,
        data.access.serviceCatalog,
        self.options.useInternal);
    }

    self.user = data.access.user;
    self.raw = data;
    callback(err, self);
  });
};

/**
 * Identity.validateToken
 *
 * This is an administrative API that allows a admin user to validate the token of
 * another authenticated user.
 *
 * @param {String}  token   the token to validate
 * @param {String|Function}  [belongsTo]  The tenantId of the user to match with the token
 * @param callback
 */
Identity.prototype.validateToken = function(token, belongsTo, callback) {

  var self = this;

  if (!token || typeof token === 'function') {
    throw new Error('Token is a required argument');
  }

  if (typeof belongsTo === 'function' && !callback) {
    callback = belongsTo;
    belongsTo = null;
  }

  if (self.token) {
    validate();
  }
  else {
    self.authorize(function(err) {
      if (err) {
        return callback(err);
      }

      validate();
    });
  }

  function validate() {

    var url = self.options.adminAuthUrl
      ? urlJoin(self.options.adminAuthUrl, '/v2.0')
      : self.serviceCatalog.getServiceByType('identity').getEndpointUrl({ admin: true });

    var options = {
      uri: urlJoin(url, '/tokens', token),
      method: 'GET',
      headers: {
        'X-Auth-Token': self.token.id,
        'User-Agent': util.format('nodejs-pkgcloud/%s', pkgcloud.version)
      }
    };

    if (belongsTo) {
      options.qs = {
        belongsTo: belongsTo
      };
    }

    request(options, function(err, res, body) {
      var error = getError(err, res, body);

      return error
        ? callback(error)
        : callback(error, body);
    });
  }
};


/**
 *  Identity.getTenantInfo
 *
 *  This is an administrative API that allows a admin to get detailed information about the specified tenant by ID
 *
 *  @param {String|Function}  [tenantId]  The tenantId for which we are seeking info
 *  @param callback
 *
 */
Identity.prototype.getTenantInfo = function(tenantId, callback) {

  var self = this;

  if (typeof tenantId === 'function' && !callback) {
    callback = tenantId;
    tenantId = null;
  }

 if (self.token) {
     tenantInfo();
   }
   else {
     self.authorize(function(err) {
       if (err) {
         return callback(err);
       }

       tenantInfo();
     });
   }

   function tenantInfo() {

    var url = self.options.adminAuthUrl
      ? urlJoin(self.options.adminAuthUrl, '/v2.0')
      : self.serviceCatalog.getServiceByType('identity').getEndpointUrl({ admin: true });

    var options = {
      uri: urlJoin(url, '/tenants', tenantId ? tenantId : ''),
      method: 'GET',
      headers: {
        'X-Auth-Token': self.token.id,
        'User-Agent': util.format('nodejs-pkgcloud/%s', pkgcloud.version)
      }
    };

    request(options, function(err, res, body) {
      var error = getError(err, res, body);

      return error
        ? callback(error)
        : callback(error, body);
    });
  }
};

function getError(err, res, body) {
  if (err) {
    return err;
  }

  var statusCode = res.statusCode.toString(),
    err2;

  if (Object.keys(failCodes).indexOf(statusCode) !== -1) {
    //
    // TODO: Support more than JSON errors here
    //
    err2 = {
      failCode: failCodes[statusCode],
      statusCode: res.statusCode,
      message: 'Error (' +
        statusCode + '): ' + failCodes[statusCode],
      href: res.request.uri.href,
      method: res.request.method,
      headers: res.headers
    };

    try {
      err2.result = typeof body === 'string' ? JSON.parse(body) : body;
    } catch (e) {
      err2.result = { err: body };
    }

    return err2;
  }

  return;
}
