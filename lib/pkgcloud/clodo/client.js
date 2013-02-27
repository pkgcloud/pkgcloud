/*
 * client.js: Base client from which all Rackspace clients inherit from
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    request = require('request'),
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
