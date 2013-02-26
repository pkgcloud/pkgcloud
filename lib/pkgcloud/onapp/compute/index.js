/*
 * index.js: Top-level include for the Onapp compute module
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

exports.Client = require('./client').Client;
exports.Server = require('./server').Server;

exports.createClient = function (options) {
  return new exports.Client(options);
};
