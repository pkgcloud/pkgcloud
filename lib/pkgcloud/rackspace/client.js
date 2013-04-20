/*
 * client.js: Base client from which all Rackspace clients inherit from
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    request = require('request'),
    morestreams = require('morestreams'),
    auth = require('../common/auth'),
    base = require('../core/base');

var Client = exports.Client = function (options) {
  base.Client.call(this, options);

  this.authUrl    = options.authUrl || 'auth.api.rackspacecloud.com';
  this.serversUrl = options.serversUrl || 'servers.api.rackspacecloud.com';
  this.provider   = 'rackspace';

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

  authOptions = {
    uri: 'https://' + this.authUrl + '/v1.0',
    headers: {
      'HOST': this.authUrl,
      'X-AUTH-USER': this.config.username,
      'X-AUTH-KEY': this.config.apiKey
    }
  };

  request(authOptions, function (err, res, body) {
    if (err) {
      return callback(err);
    }

    self.authorized = true;
    self.config.serverUrl = res.headers['x-server-management-url'];
    self.config.storageUrl = res.headers['x-storage-url'];
    self.config.cdnUrl = res.headers['x-cdn-management-url'];
    self.config.authToken = res.headers['x-auth-token'];

    callback(null, res);
  });
};

Client.prototype.serviceUrl = function (service) {
  var serviceName = service + 'Url',
      args = Array.prototype.slice.call(arguments, 1),
      json = (typeof(args[args.length - 1]) === 'boolean') && args.pop();
  
  return [this.config[serviceName]].concat(args).join('/') + (json ? '?format=json' : '');
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
