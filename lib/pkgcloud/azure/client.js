/*
 * client.js: Base client from which all Azure clients inherit from
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    request = require('request'),
    base = require('../core/base'),
    azure = require('azure');

var Client = exports.Client = function (options) {
  base.Client.call(this, options);

  options = options || {};

  // Allow overriding serversUrl in child classes
  this.provider   = 'azure';
  this.version = options.version || azure.Constants.HeaderConstants.TARGET_STORAGE_VERSION;
  this.serversUrl = options.serversUrl 
    || this.serversUrl
    || azure.ServiceClient.CLOUD_BLOB_HOST;
    
  if (!this.before) {
    this.before = [];
  }
};

utile.inherits(Client, base.Client);

Client.prototype._toArray = function toArray(obj) {
  if (typeof obj === 'undefined') {
    return [];
  }
  
  return Array.isArray(obj) ? obj : [obj];
};

Client.prototype._getBlobService = function() {
  return azure.createBlobService(
     this.config.auth.username,
     this.config.auth.apiKey,
     azure.ServiceClient.CLOUD_BLOB_HOST)
     .withFilter(new azure.ExponentialRetryPolicyFilter()
   );
};

Client.prototype._getManagementService = function() {

  var auth = {
    keyfile: this.config.auth.pemFile,
    certfile: this.config.auth.pemFile
  };

  var hostOptions = {
    host: azure.ServiceClient.CLOUD_SERVICE_MANAGEMENT_HOST,
    apiversion: '2012-03-01', // TODO: need a constant for this
    serializetype: 'XML'
  };

  return azure.createServiceManagementService(this.config.auth.subscriptionId,auth,hostOptions);
};



Client.prototype.failCodes = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Resize not allowed',
  404: 'Item not found',
  409: 'Build in progress',
  413: 'Over Limit',
  415: 'Bad Media Type',
  500: 'Fault',
  503: 'Service Unavailable'
};

Client.prototype.successCodes = {
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-authoritative information',
  204: 'No content'
};
