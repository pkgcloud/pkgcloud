/*
 * client.js: Storage client for Rackspace Cloudfiles
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    urlJoin = require('url-join'),
    rackspace = require('../../client'),
    _ = require('underscore');

const CONTAINER_META_PREFIX = 'x-container-meta-';
const CONTAINER_REMOVE_META_PREFIX = 'x-remove-container-meta-';
const OBJECT_META_PREFIX = 'x-object-meta-';
const OBJECT_REMOVE_META_PREFIX = 'x-object-remove-meta-';

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);

  utile.mixin(this, require('./containers'));
  utile.mixin(this, require('./cdn-containers'));
  utile.mixin(this, require('./files'));
  utile.mixin(this, require('./archive'));

  this.serviceType = 'object-store';
  this.cdnServiceType = 'rax:object-cdn';
};

utile.inherits(Client, rackspace.Client);

Client.prototype.getUrl = function (options) {
  options = options || {};

  var fragment = '',
      service = options.serviceType || this.serviceType;

  if (options.container) {
    fragment = options.container;
  }

  if (options.path) {
    fragment = urlJoin(fragment, options.path);
  }

  if (fragment === '' || fragment === '/') {
    return this.getServiceUrl(service);
  }

  return urlJoin(this.getServiceUrl(service), fragment);
};

Client.prototype.serializeMetadata = function(prefix, metadata) {

  if (!metadata) {
    return {};
  }

  var serializedMetadata = {};

  _.keys(metadata).forEach(function (key) {
    serializedMetadata[prefix + key] = metadata[key];
  });

  return serializedMetadata;
};

Client.prototype.deserializeMetadata = function (prefix, metadata) {

  if (!metadata) {
    return {};
  }

  var deserializedMetadata = {};

  _.keys(metadata).forEach(function (key) {
    if (key.indexOf(prefix) !== -1) {
      deserializedMetadata[key.split(prefix)[1]] = metadata[key];
    }
  });

  return deserializedMetadata;
};

Client.prototype.CONTAINER_META_PREFIX = CONTAINER_META_PREFIX;
Client.prototype.CONTAINER_REMOVE_META_PREFIX = CONTAINER_REMOVE_META_PREFIX;
Client.prototype.OBJECT_META_PREFIX = OBJECT_META_PREFIX;
Client.prototype.OBJECT_REMOVE_META_PREFIX = OBJECT_REMOVE_META_PREFIX;
