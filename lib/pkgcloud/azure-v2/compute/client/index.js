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

Client.prototype._query = function query(action, query, callback) {
  return this._request({
    method: 'POST',
    headers: { },
    body: _.extend({ Action: action }, query)
  }, function (err, body, res) {
    if (err) { return callback(err); }
    xml2JSON(body, function (err, data) {
      return err
        ? callback(err)
        : callback(data, res);
    });
  });
};

Client.prototype.get = function get(action, callback) {
  return this._request({ path: action }, function (err, body, res) {
    if (err) {
      return callback(err);
    }
    xml2JSON(body, function (err, data) {
      return err
        ? callback(err)
        : callback(null, data, res);
    });
  });
};

Client.prototype._xmlRequest = function query(options, callback) {

  return this._request(options, function (err, body, res) {
    if (err) {
      return callback(err);
    }
    xml2JSON(body, function (err, data) {
      return err ?
        callback(err) :
        callback(null, data, res);
    });
  });
};

Client.prototype._getUrl = function (options) {
  options = options || {};

  return urlJoin(this.protocol + this.serversUrl + '/',
    (typeof options === 'string'
      ? options
      : options.path));
};


