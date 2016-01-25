  /*
 * index.js: Top-level include for the Rackspace orchestration module
 *
 * (C) 2014 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

exports.Client = require('./client').Client;
exports.Stack = require('../../openstack/orchestration/stack').Stack;
exports.Resource = require('../../openstack/orchestration/resource').Resource;

exports.createClient = function (options) {
  return new exports.Client(options);
};