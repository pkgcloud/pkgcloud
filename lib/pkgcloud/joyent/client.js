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
  base.Client.call(this, options);

  this.serversUrl = options.serversUrl 
                 || process.env.SDC_CLI_URL || 'api.joyentcloud.com';

  options.url     = 'https://' + this.serversUrl;
  this.provider   = 'joyent';
  
  if (!options.identity) {
    if (process.env.SDC_CLI_IDENTITY) {
      options.identity = process.env.SDC_CLI_IDENTITY;
    } else {
      options.identity = process.env.HOME + '/.ssh/id_rsa';
    }
  }

  if (!options.keyId && process.env.SDC_CLI_KEY_ID) {
    options.keyId = process.env.SDC_CLI_KEY_ID;
  }

  if(!options.account) {
    if(process.env.SDC_CLI_ACCOUNT)
      options.account = process.env.SDC_CLI_ACCOUNT;
    else
      throw new Error('Please specify your account');
  }

  this.client     = smartdc.createClient(options);
};

utile.inherits(Client, base.Client);