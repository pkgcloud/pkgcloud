/*
 * client.js: Base client from which all Rackspace clients inherit from
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    request = require('request'),
    ps = require('pause-stream'),
    auth = require('../common/auth'),
    base = require('../core/base'),
    pkgcloud = require('../../pkgcloud');

var Client = exports.Client = function (options) {
  base.Client.call(this, options);

  this.authUrl    = options.authUrl || 'auth.api.rackspacecloud.com';
  this.serversUrl = options.serversUrl || 'servers.api.rackspacecloud.com';
  this.protocol   = options.protocol || 'https://';
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
    uri: this.protocol + this.authUrl + '/v1.0',
    headers: {
      'HOST': this.authUrl,
      'X-AUTH-USER': this.config.username,
      'X-AUTH-KEY': this.config.apiKey,
      'User-Agent': utile.format('nodejs-pkgcloud/%s', pkgcloud.version)
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

Client.prototype.getServiceUrl = function (service) {
  var serviceName = service + 'Url';
  return this.config[serviceName];
};

Client.prototype._doRequest = function (options, callback) {

  var self = this;

  //
  // If this instance is not yet authorized, then return
  // a `BufferedStream` which can be piped to in the current
  // tick.
  //

  if (!self.authorized) {

    var buf = ps().pause();

    self.auth(function (err) {
      if (err) {
        return callback(err);
      }

      var apiStream = Client.super_.prototype._doRequest.call(self, options, callback);

      if (options.upload) {
        buf.pipe(apiStream);
      }
      else if (options.download) {
        apiStream.pipe(buf);
      }

      buf.resume();
    });

    return buf;
  }
  else {
    return Client.super_.prototype._doRequest.call(self, options, callback);
  }
};
