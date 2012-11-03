/*
 * client.js: Storage client for Azure
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
  xml2js = require('xml2js'),
  auth = require('../../../common/auth'),
  azure = require('../../client');

var Client = exports.Client = function (options) {
  this.serversUrl = 'blob.core.windows.net';

  azure.Client.call(this, options);

  utile.mixin(this, require('./containers'));
  utile.mixin(this, require('./files'));

  // add the auth keys for request authorization
  this.azureKeys = {};
  this.azureKeys.storageName = this.config.auth.storageName;
  this.azureKeys.storageApiKey = this.config.auth.storageApiKey;

  this.before.push(auth.azure.storageSignature);
};

utile.inherits(Client, azure.Client);

Client.prototype.xmlRequest = function query(method, url, errback, callback) {
  // .xmlRequest(['url'], errback, callback)
  if (typeof url === 'function') {
    callback = errback;
    errback = url;
    url = method;
    method = 'GET';
  }

  return this.request(method, url, errback, function (body, res) {
    var parser = new xml2js.Parser({explicitRoot: true});

    parser.parseString(body || '', function (err, data) {
      if (err) return errback(err);
      callback(data, res);
    });
  });
};

Client.prototype.url = function () {
  var args = Array.prototype.slice.call(arguments),
    storageAccount = args.shift();

  return [
    'http://' + this.azureKeys.storageName + '.' +
      this.serversUrl
  ].concat(args).join('/');
};
