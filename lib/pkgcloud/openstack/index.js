/*
 * index.js: Top-level include for the OpenStack module.
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

exports.compute = require('./compute');
exports.identity = require('./identity');
exports.orchestration = require('./orchestration');
exports.network = require('./network');
exports.storage = require('./storage');

var ENV_PREFIX = 'PKGCLOUD_OPENSTACK_';

exports.getConfig = function () {
  var config = {
    provider: 'openstack',
    username: process.env[ENV_PREFIX + 'USERNAME'],
    password: process.env[ENV_PREFIX + 'PASSWORD'],
    authUrl: process.env[ENV_PREFIX + 'AUTH_URL']
  };

  if (process.env[ENV_PREFIX + 'REGION']) {
    config.region = process.env[ENV_PREFIX + 'REGION'];
  }

  return config;
};