/*
 * index.js: Compute client for AWS CloudAPI
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var utile     = require('utile'),
    aws    = require('../../client');

var Client = exports.Client = function (options) {
  aws.Client.call(this, options);

  utile.mixin(this, require('./flavors'));
  utile.mixin(this, require('./images'));
  utile.mixin(this, require('./servers'));
};

utile.inherits(Client, aws.Client);

Client.prototype.url = function () {
  var args = Array.prototype.slice.call(arguments);
  return [ 'https://' + this.serversUrl ].concat(args).join('/');
};
