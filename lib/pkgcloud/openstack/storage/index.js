/*
 * index.js: Top-level include for the Openstack Object Storage
 *
 * (C) 2013 Rackspace, Ken Perkins
 * MIT LICENSE
 *
 */

exports.Account    = require('./account').Account;
exports.Client    = require('./client').Client;
exports.Container = require('./container').Container;
exports.File      = require('./file').File;

exports.createClient = function (options) {
  return new exports.Client(options);
};