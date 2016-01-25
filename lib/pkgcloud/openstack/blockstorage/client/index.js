/*
 * index.js: Openstack cinder (blockstorage) client
 *
 * (C) 2014 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var util = require('util'),
    urlJoin = require('url-join'),
    openstack = require('../../client'),
    _ = require('underscore');

var Client = exports.Client = function (options) {
  openstack.Client.call(this, options);

  _.extend(this, require('./volumetypes'));
  _.extend(this, require('./snapshots'));
  _.extend(this, require('./volumes'));

  this.serviceType = 'volume';
};

util.inherits(Client, openstack.Client);

Client.prototype._getUrl = function (options) {
  options = options || {};

  return urlJoin(this._serviceUrl,
    typeof options === 'string'
      ? options
      : options.path);

};
