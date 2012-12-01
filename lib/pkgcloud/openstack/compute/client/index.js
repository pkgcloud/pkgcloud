/*
 * index.js: Compute client for OpenStack
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

var utile     = require('utile'),
    openstack = require('../../client');

var Client = exports.Client = function (options) {
  openstack.Client.call(this, options);

  // utile.mixin(this, require('./flavors'));
  // utile.mixin(this, require('./images'));
  // utile.mixin(this, require('./servers'));
};

utile.inherits(Client, openstack.Client);

Client.prototype.url = function () {
  var args = Array.prototype.slice.call(arguments);
  return [
    this.config.computeApi || 'http://trystack.org'
  ].concat(args).join('/');
};