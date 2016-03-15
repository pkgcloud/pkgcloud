/*
 * client.js: Base client from which all OpenStack clients inherit from
 *
 * (C) 2013 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 * (C) 2015 IBM Corp.
 *
 */

var util = require('util'),
    through = require('through2'),
    base = require('../core/base'),
    errs = require('errs'),
    context = require('./context');

/**
 * Client
 *
 * @description Base client from which all OpenStack clients inherit from,
 * inherits from core.Client
 *
 * @type {Function}
 */
var Client = exports.Client = function (options) {

  var self = this;

  options.earlyTokenTimeout = typeof options.earlyTokenTimeout === 'number'
    ? options.earlyTokenTimeout
    : (1000 * 60 * 5);

  base.Client.call(this, options);

  options.identity = options.identity || context.Identity;

  this.authUrl    = options.authUrl || 'auth.api.trystack.org';
  this.provider   = 'openstack';
  this.region     = options.region;
  this.tenantId   = options.tenantId;
  this.version    = options.version || 'v2.0';
  this.keystoneAuthVersion = options.keystoneAuthVersion || 'v2.0';

  if (!/^http[s]?\:\/\//.test(this.authUrl)) {
    this.authUrl = 'http://' + this.authUrl;
  }

  if (!this.before) {
    this.before = [];
  }

  this.before.push(function (req) {
    req.headers = req.headers || {};
    req.headers['x-auth-token'] = this._identity ? this._identity.token.id : this.config.authToken;
  });

  this.before.push(function (req) {
    if (req.headers['Content-Type'] && req.headers['Content-Type'] !== 'application/json') {
      req.json = false;
      return;
    }
    req.json = true;
    if (typeof req.body !== 'undefined') {
      req.headers['Content-Type'] = 'application/json';
    }
  });

  this._identity = new options.identity(this._getIdentityOptions());

  this._identity.on('log::*', function(message, object) {
    self.emit(this.event, message, object);
  });

  this._serviceUrl = null;
};

util.inherits(Client, base.Client);

Client.prototype._getIdentityOptions = function() {
  var options = {
    url: this.authUrl,
    version: this.version,
    username: this.config.username,
    password: this.config.password,
    keystoneAuthVersion: this.keystoneAuthVersion
  };

  options.strictSSL = typeof this.config.strictSSL === 'boolean'
  ? this.config.strictSSL : true;

  if (this.config.domainId) {
    options.domainId = this.config.domainId;
  } else if (this.config.domainName) {
    options.domainName = this.config.domainName;
  }

  if (this.config.projectDomainName) {
    options.projectDomainName = this.config.projectDomainName;
  } else if (this.config.projectDomainId) {
    options.projectDomainId = this.config.projectDomainId;
  }

  if (this.config.tenantId) {
    options.tenantId = this.config.tenantId;
  }
  else if (this.config.tenantName) {
    options.tenantName = this.config.tenantName;
  }

  if (typeof this.config.useServiceCatalog === 'boolean') {
    options.useServiceCatalog = this.config.useServiceCatalog;
  }

  if (this.config.basePath) {
    options.basePath = this.config.basePath;
  }

  if (this.config.headers) {
    options.token = this.config.headers.authorization;
  }

  return options;
};

Client.prototype.failCodes = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Resize not allowed',
  404: 'Item not found',
  409: 'Build in progress',
  413: 'Over Limit',
  415: 'Bad Media Type',
  422: 'Unprocessable Entity',
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

/**
 * Client.auth
 *
 * @description This function handles the primary authentication for OpenStack
 * and, if successful, sets an identity object on the client
 *
 * @param callback
 */
Client.prototype.auth = function (callback) {
  var self = this;

  if (self._isAuthorized()) {
    callback();
    return;
  }

  self._identity.authorize(function(err) {
    if (err) {
      return callback(err);
    }

    var options = {
      region: self.region,
      serviceType: self.serviceType,
      useInternal: self.config.useInternal,
      useAdmin: self.config.useAdmin
    };

    try {
      self._serviceUrl = self._identity.getServiceEndpointUrl(options);

      self.emit('log::trace', 'Selected service url', {
        serviceUrl: self._serviceUrl,
        options: options
      });

      callback();
    }
    catch (e) {
      self.emit('log::error', 'Unable to select endpoint for service', {
        error: e.toString(),
        options: options
      });
      callback(e);
    }
  });
};

/**
 * Client._request
 *
 * @description custom request implementation for supporting inline auth for
 * OpenStack. this allows piping while not yet possessing a valid auth token
 *
 * @param {object}          options     options for this client request
 * @param {Function}        callback    the callback for the client request
 * @private
 */
Client.prototype._request = function (options, callback) {

  var self = this;
  if (!self._isAuthorized()) {
    self.emit('log::trace', 'Not-Authenticated, inlining Auth...');
    var proxyStream = through();
    proxyStream.pause();

    self.auth(function (err) {
      if (err) {
        self.emit('log::error', 'Error with inline authentication', err);
        if (callback) {
          return errs.handle(err, callback);
        }

        return errs.handle(err, function (err) {
          if (err) {
            proxyStream.emit('error', err);
          }
        });
      }

      self.emit('log::trace', 'Creating Authenticated Proxy Request');
      var apiStream = Client.super_.prototype._request.call(self, options, callback);

      proxyStream.on('abort', function () {
        apiStream.abort();
      });

      proxyStream.abort = function () {
        apiStream.abort();
      };

      if (options.upload) {

        // needed for event propagation during proxied auth for streams
        apiStream.on('error', function (err) {
          proxyStream.emit('error', err);
        });

        apiStream.on('complete', function (response) {
          proxyStream.emit('complete', response);
        });

        proxyStream.pipe(apiStream);
      }
      else if (options.download) {
        apiStream.on('error', function (err) {
          proxyStream.emit('error', err);
        });

        apiStream.on('response', function (response) {
          proxyStream.emit('response', response);
        });
        apiStream.pipe(proxyStream);
      }

      proxyStream.resume();
    });

    return proxyStream;
  }
  else {
    self.emit('log::trace', 'Creating Authenticated Request');
    return Client.super_.prototype._request.call(self, options, callback);
  }
};

Client.prototype._isAuthorized = function () {
  var self = this,
      authorized = false;

  if (!self._serviceUrl || !self._identity || !self._identity.token || !self._identity.token.id || !self._identity.token.expires) {
    authorized = false;
  }
  else if (self._identity.token.expires.getTime() - new Date().getTime() > self.config.earlyTokenTimeout) {
    authorized = true;
  }

  return authorized;
};
