/*
 * client.js: Storage client for Openstack Object Storage
 *
 * (C) 2013 Rackspace, Ken Perkins
 * MIT LICENSE
 *
 */

var utile = require('utile'),
    urlJoin = require('url-join'),
    openstack = require('../../client'),
    StorageClient = require('../storageClient').StorageClient,
    _ = require('underscore');

var Client = exports.Client = function (options) {
  openstack.Client.call(this, options);

  utile.mixin(this, require('./containers'));
  utile.mixin(this, require('./files'));

  this.serviceType = 'object-store';
};

utile.inherits(Client, openstack.Client);
_.extend(Client.prototype, StorageClient.prototype);
