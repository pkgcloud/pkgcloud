/*
 * client.js: Storage client for Rackspace Cloudfiles
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    urlJoin = require('url-join'),
    rackspace = require('../../client');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  utile.mixin(this, require('./containers'));
  utile.mixin(this, require('./directories'));
  utile.mixin(this, require('./files'));

  this.serviceType = 'object-store';
};

utile.inherits(Client, rackspace.Client);

Client.prototype.getUrl = function (options) {
  options = options || {};

  if (!options || options === '' || options.path === '') {
    return this.getServiceUrl(this.serviceType);
  }

  return urlJoin(this.getServiceUrl(this.serviceType), (typeof options === 'string' ?
    options : options.path));
};

Client.prototype.ls = function (path, callback) {

};

Client.prototype.rm = function (path, callback) {

};

Client.prototype.cp = function (options, callback) {

};