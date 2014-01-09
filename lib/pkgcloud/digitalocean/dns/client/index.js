/*
 * index.js: DigitalOcean DNS client
 *
 * (C) 2014 Maciej Małecki
 * MIT LICENSE
 *
 */

var utile = require('utile'),
    urlJoin = require('url-join'),
    digitalocean = require('../../client');

var Client = exports.Client = function (options) {
  digitalocean.Client.call(this, options);

  utile.mixin(this, require('./records.js'));
  utile.mixin(this, require('./zones.js'));
};
utile.inherits(Client, digitalocean.Client);

Client.prototype.getUrl = function (options) {
  options = options || {};

  var root = this.serversUrl
    ? this.protocol + this.serversUrl
    : this.protocol + 'api.digitalocean.com';

  return urlJoin(root, typeof options === 'string'
    ? options
    : options.path);
};
