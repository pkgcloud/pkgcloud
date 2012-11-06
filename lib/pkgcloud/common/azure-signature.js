/*
 * azure-signature.js: Implementation of authentication for Azure APIs.
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var url = require('url'),
  qs = require('querystring'),
  https = require('https'),
  SharedKey = require('../azure2/utils/sharedkey');

//TODO: move to azureConstants.js
var MANAGEMENT_API_VERSION = '2012-03-01';
var STORAGE_API_VERSION = '2011-08-18';

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

  req.headers['x-ms-version'] =  '2012-03-01';
  req.headers['accept'] = 'application/xml';
  req.headers['content-type'] = 'application/xml';
  req.agent = new https.Agent({host: 'management.core.windows.net', key: options.key, cert: options.cert});
};

exports.storageSignature = function storageSignature(req, options) {

  options = options || {};

  if (typeof options.storageName !== 'string') {
    throw new TypeError('`storageName` is a required argument for azure-signature');
  }

  if (typeof options.storageApiKey !== 'string') {
    throw new TypeError('`storageApiKey` is a required argument for azure-signature');
  }

  var sharedKey = new SharedKey(options.storageName, options.storageApiKey);
  sharedKey.signRequest(req);
};
