/*
 * client.js: Base client from which all Joyent clients inherit from
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var utile   = require('utile'),
    request = require('request'),
    base    = require('../core/base');

var Client = exports.Client = function (options) {
  base.Client.call(this, options);

  this.serversUrl = options.serversUrl || 'api.joyentcloud.com';
  this.provider   = 'joyent';
};

utile.inherits(Client, base.Client);