/*
 * client.js: Storage client for Rackspace Cloudfiles
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    base = require('../../Client');

var Client = exports.Client = function (options) {
  base.Client.call(this, options);
  
  utile.mixin(this, require('./containers'));
  utile.mixin(this, require('./directories'));
  utile.mixin(this, require('./files'));
};

utile.inherits(Client, base.Client);

Client.prototype.url = function () {
  var args = Array.prototype.slice.call(arguments),
      json = (typeof(args[args.length - 1]) === 'boolean') && args.pop();
  
  return [this.config.storageUrl].concat(args).join('/') + (json ? '?format=json' : '');
};