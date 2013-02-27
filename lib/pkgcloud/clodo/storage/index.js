/*
 * index.js: Top-level include for the Rackspace storage module
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

exports.Client    = require('./client').Client;
exports.Container = require('./container').Container;
exports.Directory = require('./directory').Directory;
exports.File      = require('./file').File;

exports.createClient = function (options) {
  return new exports.Client(options);
};