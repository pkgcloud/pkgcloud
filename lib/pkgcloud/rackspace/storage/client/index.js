/*
 * client.js: Storage client for Rackspace Cloudfiles
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    rackspace = require('../../client');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);
  
  utile.mixin(this, require('./containers'));
  utile.mixin(this, require('./directories'));
  utile.mixin(this, require('./files'));
};

utile.inherits(Client, rackspace.Client);

Client.prototype.url = function () {
  return this.serviceUrl.apply(this, ['storage'].concat(Array.prototype.slice.call(arguments)));
};

Client.prototype.ls = function (path, callback) {
  
};

Client.prototype.rm = function (path, callback) {
  
};

Client.prototype.cp = function (options, callback) {
  
};