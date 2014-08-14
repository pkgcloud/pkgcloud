/*
 * client.js: Compute client for Rackspace Cloudservers
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var util = require('util'),
    rackspace = require('../../client'),
    ComputeClient = require('../../../openstack/compute/computeClient').ComputeClient,
    _ = require('underscore');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  _.extend(this, require('../../../openstack/compute/client/flavors'));
  _.extend(this, require('../../../openstack/compute/client/images'));
  _.extend(this, require('../../../openstack/compute/client/servers'));
  _.extend(this, require('../../../openstack/compute/client/extensions'));

  // rackspace specific extensions
  _.extend(this, require('./extensions/networksv2'));
  _.extend(this, require('./extensions/virtual-interfacesv2'));

  this.serviceType = 'compute';
};

util.inherits(Client, rackspace.Client);
_.extend(Client.prototype, ComputeClient.prototype);
