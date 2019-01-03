/*
 * client.js: Storage client for AWS S3
 *
 * (C) 2011 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var util = require('util'),
    AWS = require('aws-sdk'),
    amazon = require('../../client'),
    _ = require('lodash');

var Client = exports.Client = function (options) {
  amazon.Client.call(this, options);

  _.extend(this, require('./containers'));
  _.extend(this, require('./files'));

  this.s3 = new AWS.S3(this._awsConfig);
};

util.inherits(Client, amazon.Client);
