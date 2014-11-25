/*
 * client.js: Client for Openstack networking
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var util = require('util'),
    urlJoin = require('url-join'),
    openstack = require('../../client'),
    NetworkClient = require('../networkClient').NetworkClient,
    _ = require('underscore');

var Client = exports.Client = function (options) {
  openstack.Client.call(this, options);

  this.models = {
    Network: require('../network').Network,
    Subnet: require('../subnet').Subnet,
    Port: require('../port').Port
  };

  _.extend(this, require('./networks'));
  _.extend(this, require('./subnets'));
  _.extend(this, require('./ports'));

  this.serviceType = 'network';
};

util.inherits(Client, openstack.Client);
_.extend(Client.prototype, NetworkClient.prototype);

/**
 * client._getUrl
 *
 * @description get the url for the current networking service
 *
 * @param options
 * @returns {exports|*}
 * @private
 */
Client.prototype._getUrl = function(options) {
  if (options.path) {
    options.path = urlJoin('v2.0', options.path);
  }
  return NetworkClient.prototype._getUrl.call(this, options);
};
