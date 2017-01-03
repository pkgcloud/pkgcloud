/*
 * index.js: Compute client for Azure
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var util = require('util');
var urlJoin = require('url-join');
var https = require('https');
var auth = require('../../../common/auth');
var constants = require('../../constants');
var azure = require('../../client');
var _ = require('lodash');

var Client = exports.Client = function (options) {
  azure.Client.call(this, options);

  this.models = this.models || {};
  this.models.Flavor = require('../flavor').Flavor;
  this.models.Image = require('../image').Image;
  this.models.Server = require('../server').Server;

  _.extend(this, require('./flavors'));
  _.extend(this, require('./images'));
  _.extend(this, require('./servers'));

  this.serversUrl = options.serversUrl || constants.MANAGEMENT_ENDPOINT;
  this.subscriptionId = this.config.subscriptionId;

  this.azureKeys = {
    key: this.config.key,
    cert: this.config.cert
  };

  this.azureKeys.subscriptionId = this.config.subscriptionId;

  this.before.push(auth.azure.managementSignature);

  // The https agent is used by request for authenticating TLS/SSL https calls
  if (this.protocol === 'https://') {
    this.before.push(function (req) {
      req.agent = new https.Agent({
        host: this.serversUrl,
        key: options.key,
        cert: options.cert
      });
    });
  }
};

util.inherits(Client, azure.Client);