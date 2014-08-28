/*
 * index.js: Compute client for OpenStack
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

var util = require('util'),
    openstack = require('../../client'),
    ComputeClient = require('../computeClient').ComputeClient,
    _ = require('underscore');

var Client = exports.Client = function (options) {
  openstack.Client.call(this, options);

  _.extend(this, require('./flavors'));
  _.extend(this, require('./images'));
  _.extend(this, require('./servers'));
  _.extend(this, require('./extensions'));

  this.serviceType = 'compute';
};

util.inherits(Client, openstack.Client);
_.extend(Client.prototype, ComputeClient.prototype);
