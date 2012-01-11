/*
 * client.js: Storage client for Rackspace Cloudfiles CDN
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    storage = require('../../storage/client');

var Client = exports.Client = function (options) {
  storage.Client.call(this, options);
};

utile.inherits(Client, storage.Client);

Client.prototype.url = function () {
  return this.serviceUrl.apply(this, ['cdn'].concat(Array.prototype.slice.call(arguments)));
};