/*
 * client.js: Storage client for Azure
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var util = require('util'),
    azureApi = require('../../utils/azureApi.js'),
    azure = require('../../client'),
    _ = require('lodash');

var Client = exports.Client = function (options) {
  azure.Client.call(this, options);

  this.models = {
    Container: require('../container').Container,
    File: require('../file').File
  };

  _.extend(this, require('./containers'));
  _.extend(this, require('./files'));
};

util.inherits(Client, azure.Client);