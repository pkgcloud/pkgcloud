/*
 * index.js: Top-level include for the AWS S3 module
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

exports.Client = require('./client').Client;
exports.Container = require('./container').Container;
exports.File  = require('./file').File;

exports.createClient = function (options) {
  return new exports.Client(options);
};
