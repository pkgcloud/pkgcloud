  /*
 * index.js: Top-level include for the Rackspace storage module
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

exports.Client = require('./client').Client;
exports.Container = require('../../openstack/storage/container').Container;
exports.File = require('../../openstack/storage/file').File;

exports.createClient = function (options) {
  return new exports.Client(options);
};
