/*
 * client.js: Base client from which all dnsimple clients inherit from
 *
 *
 */

var util = require('util'),
    fs    = require('fs'),
    auth  = require('../common/auth'),
    base  = require('../core/base');

//
// ### constructor (options)
// #### @opts {Object} an object literal with options
// ####     @serversUrl {String} **Optional** CloudAPI Endpoint
// ####     @username   {String} **Optional** Login name
// ####     @password   {String} **Optional** Password that goes with username
// #### @throws {TypeError} On bad input
//
//
var Client = exports.Client = function (opts) {
  if (!opts) {
    throw new TypeError('options required');
  }

  if (!(opts.email && opts.password) &&
      !(opts.email && opts.apiKey)) {
    throw new TypeError('Either email/password or email/apiKey are required');
  }

  // default values
  opts.apiVersion = opts.apiVersion || 'v1';

  base.Client.call(this, opts);

  this.provider   = 'dnsimple';
  this.serversUrl = 'api.dnsimple.com/v1/';
  this.protocol   = opts.protocol || 'https://';

  if (!this.before) { this.before = []; }

  if (opts.apiKey) {
    this.before.push(function setAuthHeaders(req) {
      req.headers['X-DNSimple-Token'] = opts.email + ':' + opts.apiKey;
    });
  } else {
    this.before.push(auth.basic);
  }

  this.before.push(function setReqHeaders(req) {
    if (!req.headers.Accept) {
      req.json = true;
      req.headers.Accept = 'application/json';
      req.headers['content-type'] = 'application/json';
    }
  });

  this.before.push(function setContentTypeAndReqJson(req) {
    if (typeof req.body !== 'undefined') {
      req.json = req.body;
      delete req.body;
    }
  });
};

util.inherits(Client, base.Client);

Client.prototype.failCodes = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  409: 'Conflict',
  413: 'Request Entity Too Large',
  415: 'Unsupported Media Type',
  420: 'Slow Down',
  449: 'Retry With',
  500: 'Internal Error',
  503: 'Service Unavailable'
};

Client.prototype.successCodes = {
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-authoritative information',
  204: 'No content'
};
