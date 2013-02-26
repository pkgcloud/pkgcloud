/*
 * client.js: Compute client for Onapp Cloudservers
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile     = require('utile'),
    onapp = require('../../client');

var Client = exports.Client = function (options) {
  onapp.Client.call(this, options);
  
  utile.mixin(this, require('./servers'));
};

utile.inherits(Client, onapp.Client);

Client.prototype.url = function () {
  var args = Array.prototype.slice.call(arguments);
  return [
    this.config.serversUrl
  ].concat(args).join('/');
};
