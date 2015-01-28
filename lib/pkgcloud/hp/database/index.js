/*
 * index.js: Top-level include for the HP database module
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

exports.Client    = require('./client').Client;
exports.Flavor    = require('../../openstack/database/flavor').Flavor;
exports.Instance  = require('../../openstack/database/instance').Instance;
exports.Database  = require('../../openstack/database/database').Database;
exports.User      = require('../../openstack/database/user').User;

exports.createClient = function createClient(options) {
  return new exports.Client(options);
};
