/*
 * client.js: Storage client for Openstack Object Storage
 *
 * (C) 2013 Rackspace, Ken Perkins
 * MIT LICENSE
 *
 */

var util = require('util'),
    urlJoin = require('url-join'),
    openstack = require('../../client'),
    StorageClient = require('../storageClient').StorageClient,
    _ = require('underscore');

var Client = exports.Client = function (options) {
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
