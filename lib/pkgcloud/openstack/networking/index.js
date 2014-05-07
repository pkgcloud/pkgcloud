/*
 * index.js: Top-level include for the Openstack networking client.
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

exports.Client    = require('./client').Client;

exports.createClient = function (options) {
  return new exports.Client(options);
};
