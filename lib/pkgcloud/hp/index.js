/*
 * index.js: Top-level include for the HP module.
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 * Phani Raj
 *
 */

exports.storage = require('./storage');
exports.compute = require('./compute');
exports.network = require('./network');

var ENV_PREFIX = 'PKGCLOUD_HP_';

exports.getConfig = function () {
  var config = {
    provider: 'hp',
    username: process.env[ENV_PREFIX + 'USERNAME'],
    authUrl: process.env[ENV_PREFIX + 'AUTH_URL']
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

  return config;
};