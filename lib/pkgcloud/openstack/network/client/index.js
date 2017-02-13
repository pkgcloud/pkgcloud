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
    _ = require('lodash');

var Client = exports.Client = function (options) {
  openstack.Client.call(this, options);

  this.models = {
    Network: require('../network').Network,
    Subnet: require('../subnet').Subnet,
    Port: require('../port').Port,
    SecurityGroup: require('../securityGroup').SecurityGroup,
    SecurityGroupRule: require('../securityGroupRule').SecurityGroupRule,
    Router: require('../router').Router,
    FloatingIp: require('../floatingIp').FloatingIp,
    lbaasVip: require('../lbaasVip').lbaasVip,
    HealthMonitor: require('../lbaasHealthMonitor').HealthMonitor,
    lbaasPools: require('../lbaasPools').lbaasPools,
    lbaasMembers: require('../lbaasMembers').lbaasMembers,
    lbaasLoadbalancer: require('../lbaasLoadbalancer').lbaasLoadbalancer,
    lbaasListeners: require('../lbaasListener').lbaasListener,
    lbaasPoolsV2: require('../lbaasPoolsV2').lbaasPoolsV2,
    lbaasMembersV2: require('../lbaasMembersV2').lbaasMembersV2,
    healthMonitorV2: require('../lbaasHealthMonitorV2').lbaasHealthMonitorV2
  };

  _.extend(this, require('./networks'));
  _.extend(this, require('./subnets'));
  _.extend(this, require('./ports'));
  _.extend(this, require('./securityGroups'));
  _.extend(this, require('./securityGroupRules'));
  _.extend(this, require('./router'));
  _.extend(this, require('./floatingIp'));
  _.extend(this, require('./lbaasVip'));
  _.extend(this, require('./lbaasHealthMonitor'));
  _.extend(this, require('./lbaasPools'));
  _.extend(this, require('./lbaasMembers'));
  _.extend(this, require('./lbaasLoadbalancer'));
  _.extend(this, require('./lbaasListener'));
  _.extend(this, require('./lbaasPoolsV2'));
  _.extend(this, require('./lbaasHealthMonitorV2'));
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
