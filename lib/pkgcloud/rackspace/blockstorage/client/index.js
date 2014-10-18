/*
 * index.js: Cloud BlockStorage client for Rackspace
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var util = require('util'),
    urlJoin = require('url-join'),
    rackspace = require('../../client'),
    _ = require('underscore');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  _.extend(this, require('../../../openstack/blockstorage/client/volumetypes'));
  _.extend(this, require('../../../openstack/blockstorage/client/snapshots'));
  _.extend(this, require('../../../openstack/blockstorage/client/volumes'));

  this.serviceType = 'volume';
};

util.inherits(Client, rackspace.Client);

Client.prototype._getUrl = function (options) {
  options = options || {};

  return urlJoin(this._serviceUrl,
    typeof options === 'string'
      ? options
      : options.path);

};
