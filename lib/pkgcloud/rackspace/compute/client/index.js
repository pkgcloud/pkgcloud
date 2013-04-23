/*
 * client.js: Compute client for Rackspace Cloudservers
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile     = require('utile'),
    urlJoin   = require('url-join'),
    rackspace = require('../../client');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  utile.mixin(this, require('./flavors'));
  utile.mixin(this, require('./images'));
  utile.mixin(this, require('./servers'));
};

utile.inherits(Client, rackspace.Client);

Client.prototype.bootstrapOptions = function (options, keys) {
  return {
    personality: [{
      path:     '/root/.ssh/authorized_keys',
      contents: keys['public'].base64
    }]
  };
};

Client.prototype.getUrl = function (options) {
  options = options || {};

  return urlJoin(this.config.serverUrl || 'http://servers.api.rackspacecloud.com',
    typeof options === 'string'
      ? options
      : options.path);
};