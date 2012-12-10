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
  // utile.mixin(this, require('./images'));
  // utile.mixin(this, require('./servers'));
};

utile.inherits(Client, openstack.Client);

Client.prototype.url = function () {
  var args = Array.prototype.slice.call(arguments);
  return [
    this.config.serversUrl || 'http://trystack.org',
    'v2.0'
  ].concat(args).join('/');
};

//
// Gets the version of the OpenStack Compute API we are running against
// Parameters: callback
//
Client.prototype.getVersion = function getVersion (callback) {
  this._request({
    path: '/'
  }, callback, function (body, res) {
    return callback(null, 
      ((typeof body === 'object') ? body.version.id : JSON.parse(body).version.id));
  });
};
