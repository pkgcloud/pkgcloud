/*
 * client.js: Client for HP networking
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var util = require('util'),
    urlJoin = require('url-join'),
    hp = require('../../client'),
    NetworkClient = require('../../../openstack/network/networkClient').NetworkClient,
    _ = require('lodash');

var Client = exports.Client = function (options) {
  hp.Client.call(this, options);

  this.models = {
    Network: require('../../../openstack/network/network').Network,
    Subnet: require('../../../openstack/network/subnet').Subnet,
    Port: require('../../../openstack/network/port').Port,
    SecurityGroup: require('../../../openstack/network/securityGroup').SecurityGroup,
    SecurityGroupRule: require('../../../openstack/network/securityGroupRule').SecurityGroupRule
  };

  _.extend(this, require('../../../openstack/network/client/networks'));
  _.extend(this, require('../../../openstack/network/client/subnets'));
  _.extend(this, require('../../../openstack/network/client/ports'));
  _.extend(this, require('../../../openstack/network/client/securityGroups'));
  _.extend(this, require('../../../openstack/network/client/securityGroupRules'));

  this.serviceType = 'network';
};

util.inherits(Client, hp.Client);
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
