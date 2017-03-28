/*
 * client.js: Storage client for AWS S3
 *
 * (C) 2011 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var util = require('util'),
    AWS = require('aws-sdk'),
    s3Stream = require('s3-upload-stream'),
    amazon = require('../../client'),
    _ = require('lodash');

var Client = exports.Client = function (options) {
  amazon.Client.call(this, options);

  _.extend(this, require('./containers'));
  _.extend(this, require('./files'));

  this.s3 = new AWS.S3(this._awsConfig);

  // configure the s3Stream
  this.s3Stream = s3Stream(this.s3);
};

util.inherits(Client, amazon.Client);
