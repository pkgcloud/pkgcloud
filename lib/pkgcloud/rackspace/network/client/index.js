/*
 * client.js: client for Rackspace Networking
 *
 * (C) 2014 Rackspace
 *      Shaunak Kashyap
 * MIT License
 */

var util = require('util'),
  rackspace = require('../../client'),
  NetworkClient = require('../../../openstack/network/networkClient').NetworkClient,
  _ = require('underscore');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

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

util.inherits(Client, rackspace.Client);
_.extend(Client.prototype, NetworkClient.prototype);
