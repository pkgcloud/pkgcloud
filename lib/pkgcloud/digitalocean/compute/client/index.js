/*
 * index.js: Compute client for DigitalOcean API
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var util         = require('util'),
    urlJoin      = require('url-join'),
    digitalocean = require('../../client'),
    _ = require('underscore');

var Client = exports.Client = function (options) {
  digitalocean.Client.call(this, options);

  _.extend(this, require('./flavors'));
  _.extend(this, require('./images'));
  _.extend(this, require('./servers'));
  _.extend(this, require('./keys'));
};

util.inherits(Client, digitalocean.Client);

Client.prototype._getUrl = function (options) {
  options = options || {};

  var root = this.serversUrl
    ? this.protocol + this.serversUrl
    : this.protocol + 'api.digitalocean.com';

  return urlJoin(root, typeof options === 'string'
    ? options
    : options.path);
};
