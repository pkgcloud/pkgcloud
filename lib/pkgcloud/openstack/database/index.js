/*
 * index.js: Top-level include for the Openstack Trove module
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

exports.Client    = require('./client').Client;
exports.Flavor    = require('./flavor').Flavor;
exports.Instance  = require('./instance').Instance;
exports.Database  = require('./database').Database;
exports.User      = require('./user').User;

exports.createClient = function createClient(options) {
  return new exports.Client(options);
};
