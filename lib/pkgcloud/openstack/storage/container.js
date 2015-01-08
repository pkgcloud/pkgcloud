/*
 * container.js: Openstack Object Storage Container
 *
 * (C) 2013 Rackspace, Ken Perkins
 * MIT LICENSE
 *
 */

var util = require('util'),
    base = require('../../core/storage/container'),
    _ = require('underscore');

var Container = exports.Container = function Container(client, details) {
  base.Container.call(this, client, details);
};

util.inherits(Container, base.Container);

Container.prototype.updateHeaders = function (callback) {
  this.client.updateContainerHeaders(this, callback);
};

Container.prototype.removeHeaders = function (headersToRemove, callback) {
  this.client.removeContainerHeaders(this, headersToRemove, callback);
};

Container.prototype.updateMetadata = function (callback) {
  this.client.updateContainerMetadata(this, callback);
};

Container.prototype.removeMetadata = function (metadataToRemove, callback) {
  this.client.removeContainerMetadata(this, metadataToRemove, callback);
};

Container.prototype._setProperties = function (details) {
  this.headers = details.headers || this.headers || {};
  this._cleanHeaders();
  var headers = this.headers;
  this.name = details.name || this.name;
  this.ttl = details.ttl || this.ttl;
  this.logRetention = details.logRetention || this.logRetention;
  this.count = details.count ||
    parseInt(headers['x-container-object-count'], 10) ||
    this.count || 0;
  this.bytes = details.bytes ||
    parseInt(headers['x-container-bytes-used'], 10) ||
    this.bytes || 0;
  this.metadata = details.metadata ||
    this.client.deserializeMetadata(this.client.CONTAINER_META_PREFIX, headers) ||
    this.metadata || {};
};

Container.prototype._cleanHeaders = function() {
  if (!this.headers) { return; }
  var prefix = this.client.CONTAINER_REMOVE_HEADER_PREFIX.toLowerCase();
  var headers = this.headers;
  var omitKeys = [];
  for (var key in headers) {
    if (headers.hasOwnProperty(key) &&
       0 === key.toLowerCase().indexOf(prefix)) {
      var targetKey = this.client.CONTAINER_HEADER_PREFIX + key.slice(prefix.length);
      omitKeys.push(targetKey.toLowerCase());
      delete headers[key];
    }
  }
  for (var key in headers) {
    if (headers.hasOwnProperty(key) &&
       -1 < omitKeys.indexOf(key.toLowerCase())) {
      delete headers[key];
    }
  }
};

Container.prototype.toJSON = function () {
  return _.pick(this, ['name', 'ttl', 'logRetention', 'count',
    'bytes', 'metadata', 'headers']);
};

