/*
 * index.js: Top-level include for the DigitalOcean service
 *
 * (C) 2014 Maciej Małecki
 * MIT LICENSE
 *
 */

exports.Client = require('./client').Client;
exports.Record = require('./record').Record;
exports.Zone = require('./zone').Zone;

exports.createClient = function (options) {
  return new exports.Client(options);
};
