/*
 * client.js: Storage client for Openstack Object Storage
 *
 * (C) 2013 Rackspace, Ken Perkins
 * MIT LICENSE
 *
 */

var util = require('util'),
    openstack = require('../../client'),
    StorageClient = require('../storageClient').StorageClient,
    _ = require('underscore');

var Client = exports.Client = function (options) {
  // explicitly prevent service catalog usage if using version 1.0 for swift
  // this must happen before we call into the base openstack client.
  if (options.version === 1 || options.version === '/v1.0') {
    options.useServiceCatalog = false;
  }

  openstack.Client.call(this, options);

  this.models = {
    Container: require('../container').Container,
    File: require('../file').File
  };

  _.extend(this, require('./containers'));
  _.extend(this, require('./files'));

  this.serviceType = 'object-store';
};

util.inherits(Client, openstack.Client);
_.extend(Client.prototype, StorageClient.prototype);
