/*
 * azure-signature.js: Implementation of authentication for Azure APIs.
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var url = require('url'),
  qs = require('querystring'),
  crypto = require('crypto'),
  SharedKey = require('../azure2/utils/sharedkey');
  Buffer = require('buffer').Buffer;

//TODO: move to azureConstants.js
var MANAGEMENT_API_VERSION = '2012-03-01';
var STORAGE_API_VERSION = '2011-08-18';

exports.managementSignature = function managementSignature(req, options) {


  if (!options) options = {};

  if (typeof options.storageName !== 'string') {
    throw new TypeError('`storageName` is a required argument for azure-signature');
  }

  if (typeof options.storageApiKey !== 'string') {
    throw new TypeError('`storageApiKey` is a required argument for azure-signature');
  }

  var sharedKey = new SharedKey(options.storageName, options.storageApiKey);
  sharedKey.signRequest(req);
};

exports.storageSignature = function storageSignature(req, options) {

  if (!options) options = {};

  if (typeof options.storageName !== 'string') {
    throw new TypeError('`storageName` is a required argument for azure-signature');
  }

  if (typeof options.storageApiKey !== 'string') {
    throw new TypeError('`storageApiKey` is a required argument for azure-signature');
  }

  var sharedKey = new SharedKey(options.storageName, options.storageApiKey);
  sharedKey.signRequest(req);
};
