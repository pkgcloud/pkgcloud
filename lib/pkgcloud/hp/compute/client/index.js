/*
 * client.js: Compute client for HP Cloudservers
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 * Phani Raj
 *
 */

var util = require('util'),
    hp = require('../../client'),
    ComputeClient = require('../../../openstack/compute/computeClient').ComputeClient,
    _ = require('underscore');

var Client = exports.Client = function (options) {
  hp.Client.call(this, options);
  _.extend(this, require('../../../openstack/compute/client/flavors'));
  _.extend(this, require('../../../openstack/compute/client/images'));
  _.extend(this, require('../../../openstack/compute/client/servers'));
  _.extend(this, require('../../../openstack/compute/client/extensions/keys'));
  _.extend(this, require('../../../openstack/compute/client/extensions/floating-ips'));
  _.extend(this, require('../../../openstack/compute/client/extensions/keys'));
  _.extend(this, require('../../../openstack/compute/client/extensions/security-groups'));
  _.extend(this, require('../../../openstack/compute/client/extensions/servers'));

  this.serviceType = 'compute';
};

util.inherits(Client, hp.Client);
_.extend(Client.prototype, ComputeClient.prototype);
