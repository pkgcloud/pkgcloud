/*
 * client.js: Storage client for AWS S3
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var util = require('util'),
    urlJoin = require('url-join'),
    xml2js = require('xml2js'),
    auth = require('../../../common/auth'),
    amazon = require('../../client'),
    _ = require('underscore');

var Client = exports.Client = function (options) {
  this.serversUrl = 's3.amazonaws.com';

  amazon.Client.call(this, options);

  _.extend(this, require('./containers'));
  _.extend(this, require('./files'));

  this.before.push(auth.amazon.headersSignature);
};

util.inherits(Client, amazon.Client);

Client.prototype._xmlRequest = function query(options, callback) {

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  return this._request(options, function (err, body, res) {

    if (err) {
      return callback(err);
    }
    var parser = new xml2js.Parser();

    parser.parseString(body || '', function (err, data) {
      return err
        ? callback(err)
        : callback(null, data, res);
    });
  });
};

Client.prototype._getUrl = function (options) {
  options = options || {};

  if (typeof options === 'string') {
    return urlJoin(this.protocol + this.serversUrl, options);
  }

  return urlJoin(this.protocol +
    (options.container ? options.container + '.' : '') +
    this.serversUrl, options.path);
};
