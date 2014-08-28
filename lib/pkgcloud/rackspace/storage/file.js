/*
 * server.js: Rackspace Cloud Files file
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var util = require('util'),
  base = require('../../openstack/storage/file'),
  _ = require('underscore');

var File = exports.File = function File(client, details) {
  base.File.call(this, client, details);
};

util.inherits(File, base.File);

File.prototype.purgeFromCdn = function (emails, callback) {
  this.client.purgeFileFromCdn(this.container, this, emails, callback);
};

File.prototype.toJSON = function () {
  return _.pick(this, ['name', 'size', 'contentType', 'lastModified',
    'container', 'etag', 'metadata']);
};