/*
 * index.js: Top-level include for the Rackspace database module
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

exports.Client    = require('./client').Client;

exports.createClient = function (options) {
  return new exports.Client(options);
};
