/*
 * client.js: Base client from which all OpenStack clients inherit from
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    request = require('request'),
    auth = require('../common/auth'),
    morestreams = require('morestreams'),
    base = require('../core/base'),
    errs = require('errs'),
    identity = require('./identity');

var Client = exports.Client = function (options) {
  base.Client.call(this, options);

  this.authUrl    = options.authUrl || 'auth.api.trystack.org';
  this.provider   = 'openstack';
  this.region     = options.region || 'ORD';

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
  var self = this;

  identity.createIdentity({
    url: self.authUrl,
    username: self.config.username,
    password: self.config.password,
    region: self.region,
    tenantId: self.config.tenantId
  }, function(err, auth) {
    if (err) {
      callback(err);
      return;
    }
    self.identity = auth;
    self.authorized = true;
    callback();
  });

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

//  getToken(function (err, validToken, validTenant, urls) {
//    if (err) {
//      return callback(err);
//    }
//    self.config.authToken = validToken;
//    self.config.tenantId = validTenant;
//    utile.mixin(self.config, urls);
//    self.authorized = true;
//    callback();
//  });
};

Client.prototype.serviceUrl = function serviceUrl (service) {
  var args = Array.prototype.slice.call(arguments, 1),
    svc = this.identity ? this.identity.serviceCatalog.getServiceByType(service) : null;

  if (svc) {
    return [svc.getEndpointUrl()].concat(args).join('/');
  }
  else {
    return [].concat(args).join('/');
  }
};

Client.prototype._doRequest = function(payload) {

  var self = this,
    responded,
    buffer,
    piped,
    ended,
    dest;

  //
  // Helper function which sets the appropriate headers
  // for Rackspace Cloudfiles depending on the state of the
  // buffer.
  //
  function onPiped() {
    payload.options.headers = payload.options.headers || {};

    if (ended) {
      payload.options.headers['content-length'] = buffer.size;
    }
    else {
      // this was crashing all getServer Tests
      //options.headers['transfer-encoding'] = 'chunked';
      // from teh docs
      // The Cloud Server API does not support chunked transfer-encoding.
    }
  }

  //
  // Helper function which creates a `BufferedStream` to hold
  // any piped data while this instance is authenticating.
  //
  function createBuffer() {
    buffer = new morestreams.BufferedStream();

    buffer.emit = function(event) {
      if (event === 'end' && !responded) {
        ended = true;
        return;
      }

      morestreams.BufferedStream.prototype.emit.apply(buffer, arguments);
    };

    buffer.pipe = function(target) {
      piped = true;
      dest = target;
      morestreams.BufferedStream.prototype.pipe.apply(buffer, arguments);
    };

    buffer.on('pipe', function() {
      piped = true;
    });
  }

  function pipeUpload(response) {
    if (piped) {
      buffer.pipe(response);
    }
    else {
      buffer.on('pipe', function() {
        buffer.pipe(response);
      });
    }
  }

  function pipeDownload(response) {
    if (piped) {
      response.pipe(dest);
    }
    else {
      //
      // Remark: Do we need to do something here?
      //
    }
  }

  //
  // If this instance is not yet authorized, then return
  // a `BufferedStream` which can be piped to in the current
  // tick.
  //

  if (!self.authorized) {
    createBuffer();
    self.auth(function(err) {
      onPiped();

      var response = Client.super_.prototype._doRequest.call(self, payload);

      response.on('end', function() {
        responded = true;
        buffer.emit('end');
        buffer.removeAllListeners('pipe');
      });

      response.on('response', function(res) {
        buffer.emit('response', res);
      });

      if (payload.options.upload) {
        pipeUpload(response);
      }
      else if (payload.options.download) {
        pipeDownload(response);
      }
    });

    return buffer;
  }
  else {
    return Client.super_.prototype._doRequest.call(self, payload);
  }
};