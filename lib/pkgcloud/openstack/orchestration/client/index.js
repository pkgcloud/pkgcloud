/*
 * index.js: Orchestration client for OpenStack
 *
 * (C) 2014 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 */

var util = require('util'),
    openstack = require('../../client'),
    urlJoin = require('url-join'),
    _ = require('lodash');

var Client = exports.Client = function (options) {
  openstack.Client.call(this, options);

  _.extend(this, require('./stacks'));
  _.extend(this, require('./templates'));
  _.extend(this, require('./events'));
  _.extend(this, require('./resources'));

  this.serviceType = 'orchestration';

};

util.inherits(Client, openstack.Client);

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
Client.prototype.buildInfo = function(callback) {
  return this._request({
    path: '/build_info'
  }, function (err, body) {
    if (err) {
      return callback(err);
    }

    callback(null, body);
  });
};
