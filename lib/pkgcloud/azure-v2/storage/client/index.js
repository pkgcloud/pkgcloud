/*
 * client.js: Storage client for Azure
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var util = require('util');
var azure = require('../../client');
var _ = require('lodash');

var Client = exports.Client = function (options) {
  azure.Client.call(this, options);

  this.models = this.models || {};
  this.models.Container = require('../container').Container;
  this.models.File = require('../file').File;

  _.extend(this, require('./containers'));
  _.extend(this, require('./files'));
};

util.inherits(Client, azure.Client);