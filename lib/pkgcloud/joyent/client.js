/*
 * client.js: Base client from which all Joyent clients inherit from
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var utile    = require('utile'),
    smartdc  = require('smartdc'),
    base     = require('../core/base');

var Client = exports.Client = function (options) {
  options.url = options.url ||
                options.serversUrl ? 'https://' + options.serversUrl
              : 'https://api.joyentcloud.com';
  
  base.Client.call(this, options);

  this.serversUrl = options.serversUrl || 'api.joyentcloud.com';
  this.provider   = 'joyent';
  this.client     = smartdc.createClient(options);
};

utile.inherits(Client, base.Client);