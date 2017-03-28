/*
 * client.js: Compute client for Rackspace Cloudservers
 *
 * (C) 2011 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var util = require('util'),
    rackspace = require('../../client'),
    StorageClient = require('../../../openstack/storage/storageClient').StorageClient,
    _ = require('lodash');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  this.models = {
    Container: require('../container').Container,
    File: require('../file').File
  };

  _.extend(this, require('../../../openstack/storage/client/containers'));
  _.extend(this, require('../../../openstack/storage/client/files'));
  _.extend(this, require('./archive'));
  _.extend(this, require('./cdn-containers'));
  _.extend(this, require('./files'));

  this.serviceType = 'object-store';
  this.cdnServiceType = 'rax:object-cdn';
};

util.inherits(Client, rackspace.Client);
_.extend(Client.prototype, StorageClient.prototype);

