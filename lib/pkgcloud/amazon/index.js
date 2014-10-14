/*
 * index.js: Top-level include for the AWS module.
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

exports.compute = require('./compute');
exports.storage = require('./storage');

var ENV_PREFIX = 'PKGCLOUD_AMAZON_';

exports.getConfig = function () {
  var config = {
    provider: 'amazon',
    keyId: process.env[ENV_PREFIX + 'KEY_ID'],
    key: process.env[ENV_PREFIX + 'KEY']
  };

  if (process.env[ENV_PREFIX + 'REGION']) {
    config.region = process.env[ENV_PREFIX + 'REGION'];
  }

  return config;
};
