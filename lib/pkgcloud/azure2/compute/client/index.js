/*
 * index.js: Compute client for Azure
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var qs     = require('querystring'),
  utile  = require('utile'),
  xml2js = require('xml2js'),
  auth   = require('../../../common/auth'),
  keyfile = require('../../utils/keyfile.js'),
  azure2 = require('../../client');

var Client = exports.Client = function (options) {
  azure2.Client.call(this, options);

  utile.mixin(this, require('./flavors'));
  utile.mixin(this, require('./images'));
  utile.mixin(this, require('./servers'));
  utile.mixin(this, require('./keys'));

  this.serversUrl = options.serversUrl || 'management.core.windows.net';

  // add the auth keys for request authorization
  this.azureKeys = keyfile.readFromFile(this.config.auth.pemFile);
  this.azureKeys.subscriptionId = this.config.auth.subscriptionId;

  this.before.push(auth.azure.managementSignature);
};

utile.inherits(Client, azure2.Client);

Client.prototype.query = function query(action, query, errback, callback) {
  return this.request({
    method: 'POST',
    path: [],
    headers: { },
    body: utile.mixin({ Action: action }, query)
  }, errback, function (body, res) {
    var parser = new xml2js.Parser();

    parser.parseString(body, function (err, data) {
      return err ? errback(err) : callback(data, res);
    });
  });
};

Client.prototype.get = function get(action, errback, callback) {
  return this.request(action, errback, function (body, res) {
    var parser = new xml2js.Parser();
    parser.parseString(body, function (err, data) {
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

Client.prototype.url = function () {
  var args = Array.prototype.slice.call(arguments);
  return ['https://' + this.serversUrl].concat(args).join('/');
};
