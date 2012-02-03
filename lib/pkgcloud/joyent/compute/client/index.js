/*
 * index.js: Compute client for Joyent CloudAPI
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var utile     = require('utile'),
    rackspace = require('../../client');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  utile.mixin(this, require('./flavors'));
  utile.mixin(this, require('./images'));
  utile.mixin(this, require('./servers'));
};

utile.inherits(Client, rackspace.Client);

Client.prototype.url = function () {
  var args = Array.prototype.slice.call(arguments);
  return [
    this.config.serverUrl || 'https://api.joyentcloud.com'
  ].concat(args).join('/');
};
