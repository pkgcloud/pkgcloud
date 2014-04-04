/*
 * client.js: Compute client for Rackspace Cloudservers
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    rackspace = require('../../client'),
    StorageClient = require('../../../openstack/storage/storageClient').StorageClient,
    Container = require('../container').Container,
    File = require('../file').File,
    _ = require('underscore');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  utile.mixin(this, require('../../../openstack/storage/client/containers').enableContainers(Container));
  utile.mixin(this, require('../../../openstack/storage/client/files').enableFiles(Container, File));
  utile.mixin(this, require('./archive'));
  utile.mixin(this, require('./cdn-containers'));
  utile.mixin(this, require('./files'));

  this.serviceType = 'object-store';
  this.cdnServiceType = 'rax:object-cdn';
};

utile.inherits(Client, rackspace.Client);
_.extend(Client.prototype, StorageClient.prototype);

