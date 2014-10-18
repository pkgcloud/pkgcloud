/*
 * index.js: Compute client for AWS CloudAPI
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var AWS    = require('aws-sdk'),
    qs     = require('querystring'),
    util   = require('util'),
    urlJoin = require('url-join'),
    amazon = require('../../client'),
    _      = require('underscore');

var Client = exports.Client = function (options) {
  amazon.Client.call(this, options);

  this.securityGroup = options.securityGroup;

  _.extend(this, require('./flavors'));
  _.extend(this, require('./images'));
  _.extend(this, require('./servers'));
  _.extend(this, require('./keys'));
  _.extend(this, require('./groups'));

  this.ec2 = new AWS.EC2();
};

util.inherits(Client, amazon.Client);
