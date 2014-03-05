/*
 * index.js: Top-level include for the Rackspace Cloud LoadBalancers module
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

exports.Client = require('./client').Client;
exports.Entity = require('./entity').Entity;

exports.createClient = function (options) {
  return new exports.Client(options);
};
