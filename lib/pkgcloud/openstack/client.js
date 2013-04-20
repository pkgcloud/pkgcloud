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

/**
 * Client
 *
 * @description Base client from which all OpenStack clients inherit from,
 * inherits from core.Client
 *
 * @type {Function}
 */
var Client = exports.Client = function (options) {
  base.Client.call(this, options);

  this.authUrl    = options.authUrl || 'auth.api.trystack.org';
  this.provider   = 'openstack';
  this.region     = options.region;

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

  var options = {
    url: self.authUrl,
    username: self.config.username,
    password: self.config.password,
    region: self.region
  };

  if (self.config.tenantId) {
    options.tenantId = self.config.tenantId;
  }
  else if (self.config.tenantName) {
    options.tenantName = self.config.tenantName;
  }

  identity.createIdentity(options, function(err, auth) {
    if (err) {
      return callback(err);
    }

    self.identity = auth;
    self.authorized = true;
    callback();
  });
};

/**
 * Client.serviceUrl
 *
 * @description gets the endpoint for a given service (by type)
 *
 * @param {String}    service   the service type to get an endpoint for
 * @returns {string}            the service endpoint url
 */
Client.prototype.serviceUrl = function serviceUrl (service) {
  var args = Array.prototype.slice.call(arguments, 1),
    svc = this.identity ? this.identity.serviceCatalog.getServiceByType(service) : null;

  if (svc) {
    return [svc.getEndpointUrl()].concat(args).join('/');
  }
  else {
    // TODO should this do something else? This seems brittle
    return [].concat(args).join('/');
  }
};

/**
 * Client._doRequest
 *
 * @description custom _doRequest implementation for supporting inline auth for
 * OpenStack. this allows piping while not yet possesing a valid auth token
 *
 * @param payload
 * @returns {*}
 * @private
 */
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
      // TODO: Do we need to do something here?
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

      // TODO deal with error here

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