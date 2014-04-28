  /*
 * index.js: Top-level include for the HP storage module
 *
 * (C) 2014 HP
 * Phani Raj
 *
 */

exports.Client = require('./client').Client;
exports.Container = require('../../openstack/storage/container').Container;
exports.File = require('../../openstack/storage/file').File;

exports.createClient = function (options) {
  return new exports.Client(options);
};
