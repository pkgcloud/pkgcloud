/*
 * file.js: Openstack Object Storage File (i.e. StorageObject)
 *
 * (C) 2013 Rackspace, Ken Perkins
 * MIT LICENSE
 *
 */

var util = require('util'),
    _ = require('underscore'),
    base = require('../../core/storage/file');

var File = exports.File = function File(client, details) {
  base.File.call(this, client, details);
};

util.inherits(File, base.File);

File.prototype.updateMetadata = function (callback) {
  this.client.updateFileMetadata(this.container, this, callback);
};

File.prototype.copy = function (options, callback) {
  this.client.copy(options, callback);
};

File.prototype._setProperties = function (details) {
  var self = this;

  this.metadata = {};
  this.container = details.container || null;
  this.name = details.name || details.subdir || null;
  this.etag = details.etag || details.hash || null;

  if (details.subdir) {
    this.contentType = 'application/directory';
  } else {
    this.contentType = details['content-type'] || details['content_type'] || null;
  }

  this.lastModified = details['last-modified']
    ? new Date(details['last-modified'])
    : details['last_modified']
    ? new Date(details['last_modified'])
    : null;

  this.size = this.bytes = details['content-length']
    ? parseInt(details['content-length'], 10)
    : details['bytes']
    ? parseInt(details['bytes'], 10)
    : null;

  Object.keys(details).forEach(function (header) {
    var match;
    if (match = header.match(/x-object-meta-(\w+)/i)) {
      self.metadata[match[1]] = details[header];
    }
  });
};

File.prototype.toJSON = function () {
  return _.pick(this, ['name', 'etag', 'size', 'storageClass', 'lastModified', 'container', 'location' ]);
};

