/*
 * index.js: Top-level include for the Openstack networking client.
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

exports.Client  = require('./client').Client;
exports.Network = require('./network').Network;
exports.Subnet = require('./subnet').Subnet;
exports.Port = require('./port').Port;
exports.SecurityGroup = require('./securityGroup').SecurityGroup;
exports.SecurityGroupRule = require('./securityGroup').SecurityGroupRule;
exports.Router = require('./router').Router;
exports.floatingIp = require('./floatingIp').floatingIp;
exports.lbaasVip = require('./lbaasVip').lbaasVip;
exports.HealthMonitor = require('./lbaasHealthMonitor').HealthMonitor;
exports.lbaasPools = require('./lbaasPools').lbaasPools;
exports.lbaasMembers = require('./lbaasMembers').lbaasMembers;

exports.createClient = function (options) {
  return new exports.Client(options);
};
