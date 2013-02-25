/*
 * index.js: Top-level include for the Onapp compute module
 *
 * 2013 Pedro Dias
 *
 */

exports.Client = require('./client').Client;
exports.Server = require('./server').Server;

exports.createClient = function (options) {
  return new exports.Client(options);
};
