/*
 * index.js: CDN client for OpenStack
 *
 * (C) 2014 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

var util = require('util'),
    openstack = require('../../client'),
    urlJoin = require('url-join'),
    _ = require('underscore');

var Client = exports.Client = function (options) {
  openstack.Client.call(this, options);

  _.extend(this, require('./base'));
  _.extend(this, require('./services'));
  _.extend(this, require('./flavors'));

  this.serviceType = 'cdn';

};

util.inherits(Client, openstack.Client);

/**
 * client._getUrl
 *
 * @description get the url for the current CDN service
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
