/*
 * index.js: Top-level include for the Azure module.
 *
 *  (C) Microsoft Open Technologies, Inc.   All rights reserved.
 *
 */

exports.compute = require('./compute');
exports.storage = require('./storage');
exports.database = require('./database');

var ENV_PREFIX = 'PKGCLOUD_AZURE_';

exports.getConfig = function () {
  var config = {
    provider: 'azure'
  };

  // Compute Options
  if (process.env[ENV_PREFIX + 'KEY']) {
    config.key = process.env[ENV_PREFIX + 'KEY'];
  }

  if (process.env[ENV_PREFIX + 'CERT']) {
    config.cert = process.env[ENV_PREFIX + 'CERT'];
  }

  if (process.env[ENV_PREFIX + 'SUBSCRIPTION_ID']) {
    config.subscriptionId = process.env[ENV_PREFIX + 'SUBSCRIPTION_ID'];
  }

  // Storage Options
  if (process.env[ENV_PREFIX + 'STORAGE_ACCOUNT']) {
    config.storageAccount = process.env[ENV_PREFIX + 'STORAGE_ACCOUNT'];
  }

  if (process.env[ENV_PREFIX + 'STORAGE_ACCESS_KEY']) {
    config.storageAccessKey = process.env[ENV_PREFIX + 'STORAGE_ACCESS_KEY'];
  }

  return config;
};