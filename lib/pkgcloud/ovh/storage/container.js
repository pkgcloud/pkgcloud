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

Container.prototype.refreshCdnDetails = function(callback) {
  var self = this;

  this.client._getCdnContainerDetails(this, function(err, details) {
    if (err) {
      return callback(err);
    }

    self._setProperties(details);

    return callback(err, self);
  });
};

Container.prototype.enableCdn = function(callback) {
  this.client.setCdnEnabled(this, callback);
};

Container.prototype.updateCdn = function(options, callback) {
  this.client.updateCdnContainer(this, options, callback);
};

Container.prototype._setProperties = function (details) {
  this.name = details.name || this.name;
  this.cdnEnabled = details.cdnEnabled || this.cdnEnabled || false;
  this.cdnUri = details.cdnUri || this.cdnUri;
  this.cdnSslUri = details.cdnSslUri || this.cdnSslUri;
  this.cdnStreamingUri = details.cdnStreamingUri || this.cdnStreamingUri;
  this.cdniOSUri = details.cdniOSUri || this.cdniOSUri;
  this.ttl = details.ttl || this.ttl;
  this.logRetention = details.logRetention || this.logRetention;
  this.count = details.count || this.count || 0
  this.bytes = details.bytes || this.bytes || 0;
  this.metadata = details.metadata || this.metadata || {};
};



