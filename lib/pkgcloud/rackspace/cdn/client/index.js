/*
 * client.js: client for Rackspace CDN
 *
 * (C) 2014 Rackspace
 *      Shaunak Kashyap
 * MIT License
 */

var util = require('util'),
  rackspace = require('../../client'),
  _ = require('underscore');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  this.models = {
    Service: require('../../../openstack/cdn/service').Service,
    Flavor: require('../../../openstack/cdn/flavor').Flavor
  };

  _.extend(this, require('../../../openstack/cdn/client/services'));
  _.extend(this, require('../../../openstack/cdn/client/flavors'));

  this.serviceType = 'cdn';
};

util.inherits(Client, rackspace.Client);
