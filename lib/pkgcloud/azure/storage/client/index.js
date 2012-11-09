/*
 * client.js: Storage client for Azure
 *
 * (C) Microsoft Open Technologies, Inc.
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
    var parser = new xml2js.Parser({normalize: false, trim: false});

    // TODO: xml2js can't parse ﻿<?xml version="1.0" encoding="utf-8"?> in response from Azure ?????
    var xml = body ? body.replace(/﻿<\?xml.+\?>/,'') : '';

    parser.parseString(xml || '', function (err, data) {
      if (err) {
        console.log(err);
        errback(err);
      } else {
        callback(data, res);
      }
    });
  });
};

Client.prototype.url = function () {
  var args = Array.prototype.slice.call(arguments);
  var url = 'http://' + this.azureKeys.storageName + '.' + this.serversUrl + '/';
  if(args[0]) {
    url += args[0];
  }
  if(args[1]) {
    url += args[1];
  }

  return url;
};
