/*
 * index.js: Compute client for Azure
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var qs     = require('querystring'),
  utile  = require('utile'),
  auth   = require('../../../common/auth'),
  keyfile = require('../../utils/keyfile.js'),
  azureApi = require('../../utils/azureApi.js'),
  xml2JSON = require('../../utils/xml2json.js').xml2JSON;
  azure = require('../../client');

var Client = exports.Client = function (options) {
  azure.Client.call(this, options);

  utile.mixin(this, require('./flavors'));
  utile.mixin(this, require('./images'));
  utile.mixin(this, require('./servers'));
  utile.mixin(this, require('./keys'));

  this.serversUrl = options.serversUrl || azureApi.MANAGEMENT_ENDPOINT;
  this.version = azureApi.MANAGEMENT_API_VERSION;
  this.subscriptionId = this.config.subscriptionId;


  // add the auth keys for request authorization
  if (this.config.key && this.config.cert) {
    this.azureKeys = {
      key: this.config.key,
      cert: this.config.cert
    };
  }
  else {
    this.azureKeys = keyfile.readFromFile(this.config.managementCertificate);
  }

  this.azureKeys.subscriptionId = this.config.subscriptionId;

  this.before.push(auth.azure.managementSignature);
};

utile.inherits(Client, azure.Client);

Client.prototype.query = function query(action, query, errback, callback) {
  return this.request({
    method: 'POST',
    path: [],
    headers: { },
    body: utile.mixin({ Action: action }, query)
  }, errback, function (body, res) {

    xml2JSON(body,function(err, data) {
      return err ? errback(err) : callback(data, res);
    });
  });
};

Client.prototype.get = function get(action, errback, callback) {
  return this.request(action, errback, function (body, res) {
    xml2JSON(body,function(err, data) {
      return err ? errback(err) : callback(data, res);
    });
  });
};

Client.prototype.bootstrapOptions = function (options, keys) {
  var result = {};

  if (options.keyname || options.KeyName) {
    result.KeyName = options.keyname || options.KeyName;
  }

  if (options.zone || options['AvailabilityZone']) {
    result['Placement.AvailabilityZone'] = options.zone
      || options['AvailabilityZone'];
  }

  return result;
};

Client.prototype.xmlRequest = function query(method, url, errback, callback) {
  // .xmlRequest(['url'], errback, callback)
  if (typeof url === 'function') {
    callback = errback;
    errback = url;
    url = method;
    method = 'GET';
  }

  return this.request(method, url, errback, function (body, res) {
    xml2JSON(body,function(err, data) {
      return err ? errback(err) : callback(data, res);
    });
  });
};

Client.prototype.url = function () {
  var args = Array.prototype.slice.call(arguments);
  var url = 'https://' + this.serversUrl + '/';
  if(args[0]) {
    url += args[0];
  }
  if(args[1]) {
    url += args[1];
  }

  return url;
};


