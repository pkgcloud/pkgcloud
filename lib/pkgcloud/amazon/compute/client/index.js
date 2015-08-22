/*
 * index.js: Compute client for AWS CloudAPI
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var AWS    = require('aws-sdk'),
    util   = require('util'),
    amazon = require('../../client'),
    _      = require('lodash');

var Client = exports.Client = function (options) {
  amazon.Client.call(this, options);

  this.securityGroup = options.securityGroup;

  _.extend(this, require('./flavors'));
  _.extend(this, require('./images'));
  _.extend(this, require('./servers'));
  _.extend(this, require('./keys'));
  _.extend(this, require('./groups'));

  this.ec2 = new AWS.EC2(this._awsConfig);
};

util.inherits(Client, amazon.Client);
