/*
 * container.js: Openstack Object Storage Container
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var utile = require('utile'),
    base = require('../../core/networking/network'),
    _ = require('underscore');

var Network = exports.Network = function Network(client, details) {
  base.Network.call(this, client, details);
};

Network.prototype._setProperties = function (details) {
  this.name = details.name || this.name;
  this.ttl = details.ttl || this.ttl;
  this.logRetention = details.logRetention || this.logRetention;
  this.count = details.count || this.count || 0
  this.bytes = details.bytes || this.bytes || 0;
  this.metadata = details.metadata || this.metadata || {};
};

Network.prototype.toJSON = function () {
  return _.pick(this, ['name', 'ttl', 'logRetention', 'count',
    'bytes', 'metadata']);
};
