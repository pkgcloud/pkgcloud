/*
 * index.js: Top-level include for the Rackspace database module
 *
 * (C) 2011 Nodejitsu Inc.
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
