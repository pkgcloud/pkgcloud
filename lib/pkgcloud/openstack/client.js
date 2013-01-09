/*
 * client.js: Base client from which all OpenStack clients inherit from
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    request = require('request'),
    auth = require('../common/auth'),
    base = require('../core/base'),
    errs = require('errs');

var Client = exports.Client = function (options) {
  base.Client.call(this, options);

  this.authUrl    = options.authUrl || 'auth.api.trystack.org';
  this.provider   = 'openstack';

  if (!/^http[s]?\:\/\//.test(this.authUrl)) {
    this.authUrl = 'http://' + this.authUrl;
  }

  if (!this.before) {
    this.before = [];
  }
  
  this.before.push(auth.authToken);
  this.before.push(function (req) {
    req.json = true;
    if (typeof req.body !== 'undefined') {
      req.headers['Content-Type'] = 'application/json';
    }
  });
};

utile.inherits(Client, base.Client);

Client.prototype.failCodes = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Resize not allowed',
  404: 'Item not found',
  409: 'Build in progress',
  413: 'Over Limit',
  415: 'Bad Media Type',
  500: 'Fault',
  503: 'Service Unavailable'
};

Client.prototype.successCodes = {
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-authoritative information',
  204: 'No content'
};

Client.prototype.auth = function (callback) {
  var self = this,
      authOptions;

  /**
   * Request a temporal token with username and password supplied
   */
  function getToken (cb) {
    request({
      method: 'POST',
      uri: self.authUrl + '/v2.0/tokens',
      headers: { 'Content-Type': 'application/json' },
      json: true,
      body: {
        "auth": {
          "passwordCredentials": {
            "username": self.config.username,
            "password": self.config.password
          }
        }
      } 
    }, function (err, res, body) {
      if (err) {
        return errs.handle(errs.create(err), cb);
      }

      if (body.access && body.access.token) {
        return getTenantId(body.access.token.id, cb);
      }

      errs.handle(errs.create({
        "message": "Auth failed — " +
          "Access token not provided by upstream server"
      }), cb);
    });
  }

  /**
   * With the temporal token we can discover the tenantID, a value for 
   * identify the account internally on openstack.
   */
  function getTenantId (token, cb) {
    request({
      uri: self.authUrl + '/v2.0/tenants',
      headers: { 'X-Auth-Token': token },
      json: true
    }, function (err, res, body) {
      if (err) {
        return errs.handle(errs.create(err), cb);
      }

      if (body.tenants && body.tenants[0].id) {
        return getTokenWithTenant(body.tenants[0].id, cb);
      }

      errs.handle(errs.create({
        "message": "Auth failed — " +
          "No tenants returned while authenticating"
      }), cb);
    });
  }

  /**
   * Now request a full valid token using the tenantID.
   * Also we got a catalog list with the URL for each service
   */
  function getTokenWithTenant (tenant, cb) {
    request({
      method: 'POST',
      uri: self.authUrl + '/v2.0/tokens',
      headers: { 'Content-Type': 'application/json' },
      json: true,
      body: {
        "auth": {
          "passwordCredentials": {
            "username": self.config.username,
            "password": self.config.password
          },
          "tenantId": tenant
        }
      }
    }, function (err, res, body) {
      if (err) {
        return errs.handle(errs.create(err), cb);
      }
      else if (body.access && body.access.token) {
        return setCatalogList(body.access, cb);
      }

      errs.handle(errs.create({
        "message": "Auth failed — " +
          "Access token not provided by upstream tenant server"
      }), cb);
    });
  }

  /**
   * Define the catalog list under the client config
   */
  function setCatalogList (body, cb) {
    var result = {};
    if (body.serviceCatalog && body.serviceCatalog.length > 1) {
      body.serviceCatalog.forEach(function (service) {
        var endpoints = service.endpoints.shift();
        result[service.type + 'Url'] = endpoints.publicURL;
      });
      cb(null, body.token.id, body.token.tenant.id, result);
    }
  }

  getToken(function (err, validToken, validTenant, urls) {
    if (err) {
      return callback(err);
    }
    self.config.authToken = validToken;
    self.config.tenantId = validTenant;
    utile.mixin(self.config, urls);
    self.authorized = true;
    callback();
  });
};

Client.prototype.serviceUrl = function serviceUrl (service) {
  var serviceName = service + 'Url',
      args = Array.prototype.slice.call(arguments, 1);

  return [this.config[serviceName]].concat(args).join('/');
};