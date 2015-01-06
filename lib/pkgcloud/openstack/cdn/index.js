/*
 * index.js: Top-level include for the OpenStack CDN module
 *
 * (C) 2014 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

exports.Client = require('./client').Client;
exports.Service = require('./service').Service;
exports.Flavor = require('./flavor').Flavor;

exports.createClient = function (options) {
  return new exports.Client(options);
};
