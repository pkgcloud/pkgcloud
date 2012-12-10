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

  this.authUrl    = options.authUrl || options.config.authUrl || 'auth.api.trystack.org';
  this.serversUrl = options.serversUrl || 'servers.api.trystack.org';
  this.provider   = 'openstack';

  if (!this.before) {
    this.before = [];
  }
  
  this.before.push(auth.authToken);
  this.before.push(function (req) {
    req.json = true;
    if (typeof req.body !== 'undefined') {
      req.headers['Content-Type'] = 'application/json';
      req.body = JSON.stringify(req.body);
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
      if (err) { errs.handle(errs.create(err), cb); }

      if (body.access && body.access.token) {
        getTenantId(body.access.token.id, cb);
      }
    });
  };

  function getTenantId (token, cb) {
    request({
      uri: self.authUrl + '/v2.0/tenants',
      headers: { 'X-Auth-Token': token },
      json: true
    }, function (err, res, body) {
      if (err) { errs.handle(errs.create(err), cb); }

      if (body.tenants && body.tenants[0].id) {
        getTokenWithTenant(body.tenants[0].id, cb);
      }
    });
  };

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
            "password": self.config.password,
            "tenantId": tenant
          }
        }
      }
    }, function (err, res, body) {
      if (err) { errs.handle(errs.create(err), cb); }

      if (body.access && body.access.token) {
        cb(body.access.token.id, tenant);
      }
    });
  };

  getToken(function (validToken, validTenant) {
    self.config.authToken = validToken;
    self.config.tenantId = validTenant;
    self.authorized = true;
    callback();
  });
};

Client.prototype._ensureAuth = function _ensureAuth (callback) {
  var self = this;
  if (!this.authorized) {
    this.auth(function () {
      callback();
    });
  } else { callback(); }
};

Client.prototype._request = function _request () {
  var self = this,
      args = arguments;
  this._ensureAuth(function() {
    self.request.apply(self, args);
  })
}