/*
 * client.js: Storage client for AWS S3
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var util = require('util'),
    urlJoin = require('url-join'),
    xml2js = require('xml2js'),
    AWS = require('aws-sdk'),
    s3Stream = require('s3-upload-stream'),
    auth = require('../../../common/auth'),
    pkgcloud = require('../../../../pkgcloud'),
    amazon = require('../../client'),
    _ = require('underscore');

var Client = exports.Client = function (options) {
  this.serversUrl = 's3.amazonaws.com';

  amazon.Client.call(this, options);

  _.extend(this, require('./containers'));
  _.extend(this, require('./files'));

  AWS.config.update({ accessKeyId: options.keyId, secretAccessKey: options.key });
  AWS.config.update({ region: options.region });

  if (options.serversUrl) {
    AWS.config.update({
      httpOptions: {
        proxy: options.protocol ? options.protocol + options.serversUrl : 'https://' + options.serversUrl
      }
    });
  }

  var userAgent = AWS.util.userAgent();

  AWS.util.userAgent = function() {
    return util.format('nodejs-pkgcloud/%s %s', pkgcloud.version, userAgent);
  };

  this.s3 = new AWS.S3();

  // configure the s3Stream
  s3Stream.client(this.s3);
  this.s3Stream = s3Stream;

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
