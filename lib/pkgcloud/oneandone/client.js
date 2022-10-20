/*
 * client.js: Base client
 * (C) Created by Ali Bazlamit on 8/10/2017.
 *
 */

var util = require('util'),
  OAO = require('liboneandone-2'),
  url = 'cloudpanel-api.1and1.com/v1',
  base = require('../core/base');


var Client = exports.Client = function (options) {
  if (!options || !options.token) {
    throw new TypeError('token is required');
  }
  base.Client.call(this, options);

  options = options || {};
  this.provider = 'oneandone';
  this.protocol = options.protocol || 'https://';
  this.serversUrl = options.serversUrl ? options.serversUrl : url;
  OAO.oneandoneauth(options.token);
  OAO.setendpoint(this.protocol + this.serversUrl);
};

util.inherits(Client, base.Client);


Client.prototype.failCodes = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Item not found',
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