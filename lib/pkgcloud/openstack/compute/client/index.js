/*
 * index.js: Compute client for OpenStack
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

var utile     = require('utile'),
    urlJoin   = require('url-join'),s
    openstack = require('../../client');

var Client = exports.Client = function (options) {
  openstack.Client.call(this, options);

  utile.mixin(this, require('./flavors'));
  utile.mixin(this, require('./images'));
  utile.mixin(this, require('./servers'));
  utile.mixin(this, require('./keys'));
};

utile.inherits(Client, openstack.Client);

Client.prototype.getUrl = function (options) {
  options = options || {};

  return urlJoin(this.getServiceUrl('compute'),
    typeof options === 'string'
      ? options
      : options.path);
};

//
// Gets the version of the OpenStack Compute API we are running against
// Parameters: callback
//
Client.prototype.getVersion = function getVersion(callback) {
  var self = this,
      verbose;

  this.auth(function (err) {
    if (err) {
      return callback(err);
    }

    self.request({
      uri: self.getUrl('/').replace(self.identity.token.tenant.id + '/', '')
    }, function (err, body) {
      if (err) { return callback(err); }
      verbose = ((typeof body === 'object') ? body.version : JSON.parse(body).version);
      return callback(null, verbose.id, verbose);
    });
  });
};

Client.prototype.getOsFloatingIps = function (callback) {
  this.request({
    path: 'os-floating-ips'
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.floating_ips);
  });
};

Client.prototype.bootstrapOptions = function (options, keys) {
  var result = {};

  if (options.keyname || options.key_name) {
    result.keyname = options.keyname || options.key_name;
  }

  return result;
};
