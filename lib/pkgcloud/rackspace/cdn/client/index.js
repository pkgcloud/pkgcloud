/*
 * client.js: Storage client for Rackspace Cloudfiles CDN
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    urlJoin = require('url-join'),
    storage = require('../../storage/client');

var Client = exports.Client = function (options) {
  storage.Client.call(this, options);
};

utile.inherits(Client, storage.Client);

Client.prototype.getUrl = function (options) {
  options = options || {};
  return urlJoin(this.getServiceUrl('cdn'),
    typeof options === 'string'
      ? options
      : options.path);
};