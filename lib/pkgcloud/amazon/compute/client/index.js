/*
 * index.js: Compute client for AWS CloudAPI
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var qs     = require('querystring'),
    utile  = require('utile'),
    urlJoin = require('url-join'),
    xml2js = require('xml2js'),
    auth   = require('../../../common/auth'),
    amazon = require('../../client');

var Client = exports.Client = function (options) {
  amazon.Client.call(this, options);

  this.securityGroup = options.securityGroup;

  utile.mixin(this, require('./flavors'));
  utile.mixin(this, require('./images'));
  utile.mixin(this, require('./servers'));
  utile.mixin(this, require('./keys'));
  utile.mixin(this, require('./groups'));

  this.before.push(auth.amazon.bodySignature);
};

utile.inherits(Client, amazon.Client);

Client.prototype.query = function query(action, query, callback) {
  return this.request({
    method: 'POST',
    headers: { },
    body: utile.mixin({ Action: action }, query)
  }, function (err, body, res) {
    if (err) {
      return callback(err);
    }
    var parser = new xml2js.Parser();

    parser.parseString(body, function (err, data) {
      return err
        ? callback(err)
        : callback(err, data, res);
    });
  });
};

Client.prototype.bootstrapOptions = function (options, keys) {
  var result = {},
      securityGroup;

  if (options.keyname || options.KeyName) {
    result.KeyName = options.keyname || options.KeyName;
  }

  if (options.zone || options['AvailabilityZone']) {
    result['Placement.AvailabilityZone'] = options.zone
      || options['AvailabilityZone'];
  }

  securityGroup = this.securityGroup || options.securityGroup || options['SecurityGroup'];
  if (securityGroup) {
    result['SecurityGroup'] = securityGroup;
  }

  return result;
};

Client. prototype.getUrl = function (options) {
  options = options || {};

  return urlJoin(this.protocol + this.serversUrl,
    (typeof options === 'string'
      ? options
      : options.path));
};
