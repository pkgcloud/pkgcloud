/*
 * index.js: Top-level include for the dnsimple dns service
 *
 * Tom Gallacher
 *
 */

exports.Client = require('./client').Client;
exports.Record = require('./record').Record;
exports.Zone = require('./zone').Zone;
exports.Zones = require('./zones').Zones;

exports.createClient = function (options) {
  return new exports.Client(options);
};
