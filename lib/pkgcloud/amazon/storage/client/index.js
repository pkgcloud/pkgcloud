/*
 * client.js: Storage client for AWS S3
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var util = require('util'),
    AWS = require('aws-sdk'),
    s3Stream = require('s3-upload-stream'),
    pkgcloud = require('../../../../pkgcloud'),
    amazon = require('../../client'),
    _ = require('underscore');

var Client = exports.Client = function (options) {
  amazon.Client.call(this, options);

  _.extend(this, require('./containers'));
  _.extend(this, require('./files'));

  this.s3 = new AWS.S3();

  // configure the s3Stream
  s3Stream.client(this.s3);
  this.s3Stream = s3Stream;
};

util.inherits(Client, amazon.Client);
