/*
 * index.js: Top-level include for the OpenStack identity module
 *
 * (C) 2013 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

exports.Client = require('./client').Client;

exports.createClient = function (options) {
  return new exports.Client(options);
};
