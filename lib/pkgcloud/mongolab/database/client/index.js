/*
 * index.js: Database client for MongoLab databases
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var util      = require('util'),
    urlJoin   = require('url-join'),
    base      = require('../../../core/base'),
    auth      = require('../../../common/auth'),
    _ = require('lodash');

var Client = exports.Client = function (options) {
  base.Client.call(this, options);

  if (!this.before) {
    this.before = [];
  }

  this.protocol = options.protocol || 'https://';
  this.databaseUrl = options.databaseUrl || 'api.mongolab.com';

  this.before.push(auth.basic);

  this.before.push(function (req) {
    req.json = true;
    if (typeof req.body !== 'undefined') {
      req.headers['Content-Type'] = 'application/json';
      req.body = JSON.stringify(req.body);
    }
  });

  _.extend(this, require('./databases'));
  _.extend(this, require('./accounts'));
};

util.inherits(Client, base.Client);

Client.prototype._getUrl = function (options) {
  options = options || {};

  var root = [this.protocol + this.databaseUrl,
    'api', '1', 'partners', (this.config.username)
      ? this.config.username
      : ''].join('/');

  return urlJoin(root, typeof options === 'string'
    ? options
    : options.path);
};

Client.prototype.failCodes = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Resize not allowed',
  404: 'Item or Account not found',
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