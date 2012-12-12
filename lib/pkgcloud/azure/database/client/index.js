/*
 * client.js: Database client for Azure Tables Cloud Databases
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
  azure.Client.call(this, options);

  this.serversUrl = options.serversUrl || azureApi.TABLES_ENDPOINT;

  // add the auth keys for request authorization
  this.azureKeys = {};
  this.azureKeys.storageAccount = this.config.storageAccount;
  this.azureKeys.storageAccessKey = this.config.storageAccessKey;

  this.before.push(auth.azure.tablesSignature);
  utile.mixin(this, require('./databases'));
};

utile.inherits(Client, azure.Client);

//
// Gets the version of the Azure Tables API we are running against
// Parameters: callback
//
Client.prototype.getVersion = function getVersion (callback) {
  return callback(null, azureApi.TABLES_API_VERSION);
};

Client.prototype.url = function () {
  var args = Array.prototype.slice.call(arguments);
  var url = 'http://' + this.azureKeys.storageAccount + '.' + this.serversUrl + '/';
  if (args[0]) {
    url += args[0];
  }
  if (args[1]) {
    url += args[1];
  }

  return url;
};

Client.prototype.xmlRequest = function query(method, url, errback, callback) {
  if (typeof url === 'function') {
    callback = errback;
    errback = url;
    url = method;
    method = 'GET';
  }

  return this.request(method, url, errback, function (body, res) {
    xml2JSON(body,function (err, data) {
      if (err) {
        errback(err);
      } else {
        callback(data, res);
      }
    });
  });
};

// Function formatResponse
// This function parse the response from the provider and return an object
// with the correct keys and values.
// ### @response {Object} The body response from the provider api
Client.prototype.formatResponse = function (response) {
  var database = {
    id: response.content['m:properties']['d:TableName'],
    host: this.url(),
    uri: response.id,
    username: '',
    password: ''
  };
  return database;
};

