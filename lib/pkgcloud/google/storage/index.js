/*
 * index.js: Top-level include for the Google Cloud Storage module
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

exports.Client = require('./client').Client;
exports.Container = require('./container').Container;
exports.File  = require('./file').File;

exports.createClient = function (options) {
  return new exports.Client(options);
};
