/*
 * client.js: client for Rackspace CDN
 *
 * (C) 2014 Rackspace
 *      Shaunak Kashyap
 * MIT License
 */

var util = require('util'),
  rackspace = require('../../client'),
  urlJoin = require('url-join'),
  _ = require('lodash');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  this.models = {
    Service: require('../../../openstack/cdn/service').Service,
    Flavor: require('../../../openstack/cdn/flavor').Flavor
  };

  _.extend(this, require('../../../openstack/cdn/client/base'));
  _.extend(this, require('../../../openstack/cdn/client/services'));
  _.extend(this, require('../../../openstack/cdn/client/flavors'));

  this.serviceType = 'rax:cdn';
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
