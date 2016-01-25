/*
 * index.js: Top-level include for the Rackspace Networking module.
 *
 * (C) 2014 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

exports.Client = require('./client').Client;
exports.Network = require('../../openstack/network/network').Network;
exports.Subnet = require('../../openstack/network/subnet').Subnet;
exports.Port = require('../../openstack/network/port').Port;
exports.SecurityGroup = require('../../openstack/network/securityGroup').SecurityGroup;

exports.createClient = function(options) {
  return new exports.Client(options);
};
