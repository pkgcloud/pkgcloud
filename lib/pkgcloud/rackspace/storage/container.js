/*
 * container.js: Rackspace Object Storage Container
 *
 * (C) 2013 Rackspace, Ken Perkins
 * MIT LICENSE
 *
 */

var util = require('util'),
    base = require('../../openstack/storage/container'),
    _ = require('lodash');

var Container = exports.Container = function Container(client, details) {
  base.Container.call(this, client, details);
};

util.inherits(Container, base.Container);

Container.prototype.refreshCdnDetails = function (callback) {
  var self = this;

  this.client._getCdnContainerDetails(this, function (err, details) {
    if (err) {
      return callback(err);
    }

    self._setProperties(details);

    return callback(err, self);
  });
};

Container.prototype.enableCdn = function (callback) {
  this.client.setCdnEnabled(this, callback);
};

Container.prototype.disableCdn = function (callback) {
  this.client.setCdnEnabled(this, false, callback);
};

Container.prototype.updateCdn = function (options, callback) {
  this.client.updateCdnContainer(this, options, callback);
};

Container.prototype.setStaticWebsite = function (options, callback) {
  this.client.setStaticWebsite(this, options, callback);
};

Container.prototype.removeStaticWebsite = function (callback) {
  this.client.removeStaticWebsite(this, callback);
};

Container.prototype._setProperties = function (details) {
  this.cdnEnabled = details.cdnEnabled || this.cdnEnabled || false;
  this.cdnUri = details.cdnUri || this.cdnUri;
  this.cdnSslUri = details.cdnSslUri || this.cdnSslUri;
  this.cdnStreamingUri = details.cdnStreamingUri || this.cdnStreamingUri;
  this.cdniOSUri = details.cdniOSUri || this.cdniOSUri;
  Container.super_.prototype._setProperties.call(this, details);
};

Container.prototype.toJSON = function () {
  return _.pick(this, ['name', 'ttl', 'logRetention', 'count',
    'bytes', 'cdnEnabled', 'cdnUri', 'cdnSslUri', 'cdnStreamingUri',
    'cdniOSUri', 'metadata']);
};

