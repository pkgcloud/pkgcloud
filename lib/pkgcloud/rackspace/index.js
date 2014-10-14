/*
 * index.js: Top-level include for the Rackspace module.
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

exports.blockstorage = require('./blockstorage');
exports.compute = require('./compute');
exports.database = require('./database');
exports.dns = require('./dns');
exports.loadbalancer = require('./loadbalancer');
exports.storage = require('./storage');

var ENV_PREFIX = 'PKGCLOUD_RACKSPACE_';

exports.getConfig = function() {
  var config = {
    provider: 'rackspace',
    username: process.env[ENV_PREFIX + 'USERNAME']
  };

  if (process.env[ENV_PREFIX + 'APIKEY']) {
    config.apiKey = process.env[ENV_PREFIX + 'APIKEY'];
  }
  else if (process.env[ENV_PREFIX + 'PASSWORD']) {
    config.password = process.env[ENV_PREFIX + 'PASSWORD'];
  }

  if (process.env[ENV_PREFIX + 'REGION']) {
    config.region = process.env[ENV_PREFIX + 'REGION'];
  }

  if (process.env[ENV_PREFIX + 'USE_INTERNAL']) {
    config.useInternal = true;
  }

  if (process.env[ENV_PREFIX + 'AUTH_URL']) {
    config.authUrl = process.env[ENV_PREFIX + 'AUTH_URL'];
  }

  return config;
};