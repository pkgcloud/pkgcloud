/*
 * client.js: Base client from which all OpenStack clients inherit from
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    request = require('request'),
    auth = require('../common/auth'),
    base = require('../core/base');

var Client = exports.Client = function (options) {
  base.Client.call(this, options);

  this.authUrl    = options.authUrl || 'auth.api.trystack.org';
  this.serversUrl = options.serversUrl || 'servers.api.trystack.org';
  this.provider   = 'openstack';

  if (!this.before) {
    this.before = [];
  }
  
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

};
