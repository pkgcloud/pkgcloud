/*
 * client.js: Base client from which all Onapp clients inherit from
 *
 * 2013 Pedro Dias
 *
 */

var utile = require('utile'),
    request = require('request'),
    auth = require('../common/auth'),
    base = require('../core/base');

var Client = exports.Client = function (options) {
  base.Client.call(this, options);

  this.serversUrl = options.serversUrl;
  this.provider   = 'onapp';

  if (!this.before) {
    this.before = [];
  }

  this.before.push(auth.basic);
  
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
