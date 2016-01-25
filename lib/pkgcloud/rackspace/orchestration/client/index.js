/*
 * client.js: client for Rackspace Orchestration
 *
 * (C) 2014 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 */

var util = require('util'),
  rackspace = require('../../client'),
  urlJoin = require('url-join'),
  _ = require('underscore');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  _.extend(this, require('../../../openstack/orchestration/client/events'));
  _.extend(this, require('../../../openstack/orchestration/client/resources'));
  _.extend(this, require('../../../openstack/orchestration/client/stacks'));
  _.extend(this, require('../../../openstack/orchestration/client/templates'));

  this.serviceType = 'orchestration';
};

util.inherits(Client, rackspace.Client);

/**
 * client._getUrl
 *
 * @description get the url for the current compute service
 *
 * @param options
 * @returns {exports|*}
 * @private
 */
Client.prototype._getUrl = function (options) {
  options = options || {};

  if (!this._serviceUrl) {
    throw new Error('Service url not found');
  }

  return urlJoin(this._serviceUrl,
      typeof options === 'string'
      ? options
      : options.path);
};

/**
 * client.buildInfo
 *
 * @description gets the build information for the orchestration service
 *
 * @param callback
 * @returns {*}
 */
Client.prototype.buildInfo = function (callback) {
  return this._request({
    path: '/build_info'
  }, function (err, body) {
    if (err) {
      return callback(err);
    }

    callback(null, body);
  });
};
