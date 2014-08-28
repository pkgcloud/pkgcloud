/*
 * index.js: Storage client for HP Cloudservers
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 * Phani Raj
 *
 */

var util = require('util'),
    hp = require('../../client'),
    StorageClient = require('../../../openstack/storage/storageClient').StorageClient,
    _ = require('underscore');

var Client = exports.Client = function (options) {
  hp.Client.call(this, options);

  this.models = {
    Container: require('../../../openstack/storage/container').Container,
    File: require('../../../openstack/storage/file').File
  };

  _.extend(this, require('../../../openstack/storage/client/containers'));
  _.extend(this, require('../../../openstack/storage/client/files'));

  this.serviceType = 'object-store';
};

util.inherits(Client, hp.Client);
_.extend(Client.prototype, StorageClient.prototype);
