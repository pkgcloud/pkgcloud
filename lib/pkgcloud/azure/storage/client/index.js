/*
 * client.js: Storage client for Azure
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var utile = require('utile'),
  auth = require('../../../common/auth'),
  azureApi = require('../../utils/azureApi.js'),
  xml2JSON = require('../../utils/xml2json.js').xml2JSON,
  azure = require('../../client');

var Client = exports.Client = function (options) {
  this.serversUrl = options.serversUrl || azureApi.STORAGE_ENDPOINT;

  azure.Client.call(this, options);

  utile.mixin(this, require('./containers'));
  utile.mixin(this, require('./files'));

  // add the auth keys for request authorization
  this.azureKeys = {};
  this.azureKeys.storageAccount = this.config.storageAccount;
  this.azureKeys.storageAccessKey = this.config.storageAccessKey;

  this.before.push(auth.azure.storageSignature);
};

utile.inherits(Client, azure.Client);

Client.prototype.xmlRequest = function query(method, url, errback, callback) {
  if (typeof url === 'function') {
    callback = errback;
    errback = url;
    url = method;
    method = 'GET';
  }

  return this.request(method, url, errback, function (body, res) {
    xml2JSON(body,function(err, data) {
      if (err) {
        errback(err);
      } else {
        callback(data, res);
      }
    });
  });
};

Client.prototype.url = function () {
  var args = Array.prototype.slice.call(arguments);
  var url = 'http://' + this.azureKeys.storageAccount + '.' + this.serversUrl + '/';
  if(args[0]) {
    url += args[0];
  }
  if(args[1]) {
    url += args[1];
  }

  return url;
};
