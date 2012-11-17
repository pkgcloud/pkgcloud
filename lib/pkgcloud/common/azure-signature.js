/*
 * azure-signature.js: Implementation of authentication for Azure APIs.
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var url = require('url'),
  qs = require('querystring'),
  https = require('https'),
  azureApi = require('../azure/utils/azureApi'),
  SharedKey = require('../azure/utils/sharedkey');

var MANAGEMENT_API_VERSION = azureApi.MANAGEMENT_API_VERSION;
var STORAGE_API_VERSION = azureApi.STORAGE_API_VERSION;

exports.managementSignature = function managementSignature(req, options) {

  req.headers = req.headers || {};
  options = options || {};

  if (typeof options.key !== 'string') {
    throw new TypeError('`key` is a required argument for azure-signature');
  }

  if (typeof options.cert!== 'string') {
    throw new TypeError('`cert` is a required argument for azure-signature');
  }

  if (typeof options.subscriptionId !== 'string') {
    throw new TypeError('`subscriptionId` is a required argument for azure-signature');
  }

  req.headers['x-ms-version'] =  azureApi.MANAGEMENT_API_VERSION;
  req.headers['accept'] = 'application/xml';
  req.headers['content-type'] = 'application/xml';
  req.agent = new https.Agent({host: 'management.core.windows.net', key: options.key, cert: options.cert});
};

exports.storageSignature = function storageSignature(req, options) {

  options = options || {};

  if (typeof options.storageAccount !== 'string') {
    throw new TypeError('`storageAccount` is a required argument for azure-signature');
  }

  if (typeof options.storageAccountKey !== 'string') {
    throw new TypeError('`storageAccountKey` is a required argument for azure-signature');
  }

  var sharedKey = new SharedKey(options.storageAccount, options.storageAccountKey);
  sharedKey.signRequest(req);
};
