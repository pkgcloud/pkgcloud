/*
 * client.js: Base client from which all Rackspace clients inherit from
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    identity = require('./identity'),
    base = require('../openstack/client');

var Client = exports.Client = function (options) {
  options = options || {};
  options.authUrl = options.authUrl || 'https://identity.api.rackspacecloud.com';
  options.region = options.region || 'DFW';

  base.Client.call(this, options);

  this.provider = 'rackspace';
};

utile.inherits(Client, base.Client);

Client.prototype.auth = function (callback) {
  var self = this,
    options = {
      url: self.authUrl,
      username: self.config.username,
      password: self.config.password,
      apiKey: self.config.apiKey,
      region: self.region,
      adminAuthUrl: self.authUrl
    };

  if (self.config.tenantId) {
    options.tenantId = self.config.tenantId;
  }
  else if (self.config.tenantName) {
    options.tenantName = self.config.tenantName;
  }

  if (typeof self.config.useInternal === 'boolean') {
    options.useInternal = self.config.useInternal;
  }

  identity.createIdentity(options, function (err, auth) {
    if (err) {
      callback(err);
      return;
    }

    self.identity = auth;

    callback();
  });
};
