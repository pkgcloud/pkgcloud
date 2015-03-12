/*
 * index.js: Top-level include for the MongoHQ database module
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

exports.Client    = require('./client').Client;

exports.createClient = function createClient(options) {
  return new exports.Client(options);
};
