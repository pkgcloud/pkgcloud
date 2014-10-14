/*
 * index.js: Top-level include for the DigitalOcean module.
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

exports.compute = require('./compute');

var ENV_PREFIX = 'PKGCLOUD_DIGITALOCEAN_';

exports.getConfig = function () {
  var config = {
    provider: 'digitalocean',
    clientId: process.env[ENV_PREFIX + 'CLIENTID'],
    apiKey: process.env[ENV_PREFIX + 'APIKEY']
  };

  if (process.env[ENV_PREFIX + 'REGION']) {
    config.region = process.env[ENV_PREFIX + 'REGION'];
  }

  return config;
};