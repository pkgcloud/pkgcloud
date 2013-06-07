/*
 * container.js: Rackspace Cloudfiles container
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    base = require('../../core/storage/container'),
    _ = require('underscore');

var Container = exports.Container = function Container(client, details) {
  base.Container.call(this, client, details);
};

utile.inherits(Container, base.Container);

Container.prototype.updateMetadata = function (callback) {
  this.client.updateContainerMetadata(this.container, callback);
};

Container.prototype.removeMetadata = function (metadataToRemove, callback) {
  this.client.removeContainerMetadata(this, metadataToRemove, callback);
};

Container.prototype._setProperties = function (details) {
  this.name = details.name;
  this.cdnEnabled = details.cdnEnabled || false;
  this.cdnUri = details.cdnUri;
  this.cdnSslUri = details.cdnSslUri;
  this.ttl = details.ttl;
  this.logRetention = details.logRetention;
  this.count = details.count || 0;
  this.bytes = details.bytes || 0;
  this.metadata = details.metadata || {};
};
