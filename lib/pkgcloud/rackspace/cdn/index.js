/*
 * index.js: Top-level include for the Rackspace CDN module.
 *
 * (C) 2014 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

exports.Client = require('./client').Client;
exports.Service = require('../../openstack/cdn/service').Service;
exports.Flavor = require('../../openstack/cdn/flavor').Flavor;

exports.createClient = function(options) {
  return new exports.Client(options);
};
