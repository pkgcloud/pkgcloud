/*
 * index.js: Compute client for OpenStack
 *
 * (C) 2014 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 */

var util = require('util'),
    openstack = require('../../client'),
    urlJoin = require('url-join'),
//    ComputeClient = require('../computeClient').ComputeClient,
    _ = require('underscore');

var Client = exports.Client = function (options) {
  openstack.Client.call(this, options);

  _.extend(this, require('./stacks'));
//  _.extend(this, require('./images'));
//  _.extend(this, require('./servers'));
//  _.extend(this, require('./extensions'));

  this.serviceType = 'orchestration';

};

util.inherits(Client, openstack.Client);
//_.extend(Client.prototype, ComputeClient.prototype);

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
