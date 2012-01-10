/*
 * container.js: Rackspace Cloudfiles container
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    base = require('../../core/storage/container');

var Container = exports.Container = function Container(client, details) {
  base.Container.call(this, client, details);
};

utile.inherits(Container, base.Container);

Container.prototype._setProperties = function (details) {
  this.name = details.name;
  this.cdnEnabled = details.cdnEnabled || false;
  this.cdnUri = details.cdnUri;
  this.cdnSslUri = details.cdnSslUri;
  this.ttl = details.ttl;
  this.logRetention = details.logRetention;
  this.count = details.count || 0;
  this.bytes = details.bytes || 0;
};