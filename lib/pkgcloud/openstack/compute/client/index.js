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

  utile.mixin(this, require('./flavors'));
  utile.mixin(this, require('./images'));
  utile.mixin(this, require('./servers'));
  utile.mixin(this, require('./keys'));
};

utile.inherits(Client, openstack.Client);

Client.prototype.url = function url() {
  return this.serviceUrl.apply(this, ['compute'].concat(Array.prototype.slice.call(arguments)));
};

//
// Gets the version of the OpenStack Compute API we are running against
// Parameters: callback
//
Client.prototype.getVersion = function getVersion(callback) {
  var self = this;

  this.auth(function (err) {
    if (err) {
      return callback(err);
    }

    self.request({
      url: self.url().replace(self.identity.token.tenant.id, '')
    }, callback, function (body, res) {
        var verbose = ((typeof body === 'object') ? body.version : JSON.parse(body).version);
        return callback(null, verbose.id, verbose);
    });
  });
};

Client.prototype.getOsFloatingIps = function (callback) {
  this.request('os-floating-ips', callback, function (body, res) {
    return callback(null, body.floating_ips);
  });
};

Client.prototype.bootstrapOptions = function (options, keys) {
  var result = {};

  if (options.keyname || options.key_name) {
    result.keyname = options.keyname || options.key_name;
  }

  return result;
};
