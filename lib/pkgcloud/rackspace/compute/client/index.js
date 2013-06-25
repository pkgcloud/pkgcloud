/*
 * client.js: Compute client for Rackspace Cloudservers
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
  rackspace = require('../../client'),
  ComputeClient = require('../../../openstack/compute/computeClient').ComputeClient,
  _ = require('underscore');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  utile.mixin(this, require('../../../openstack/compute/client/flavors'));
  utile.mixin(this, require('../../../openstack/compute/client/images'));
  utile.mixin(this, require('../../../openstack/compute/client/servers'));
  utile.mixin(this, require('../../../openstack/compute/client/extensions'));

  this.serviceType = 'compute';
};

utile.inherits(Client, rackspace.Client);
_.extend(Client.prototype, ComputeClient.prototype);

Client.prototype.bootstrapOptions = function (options, keys) {
  return {
    personality: [
      {
        path: '/root/.ssh/authorized_keys',
        contents: keys['public'].base64
      }
    ]
  };
};

