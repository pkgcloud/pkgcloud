/*
 * container.js: AWS S3 File
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var util  = require('util'),
    base  = require('../../core/storage/file'),
    _ = require('lodash');

var File = exports.File = function File(client, details) {
  base.File.call(this, client, details);
};

util.inherits(File, base.File);

File.prototype._setProperties = function (details) {
  this.name = details.name || details.Key;
  this.etag = details.ETag || details.etag || null;
  this.lastModified = details.LastModified || details.lastModified || null;
  this.size = +(details.Size || details['content-length'] || details.ContentLength) || 0;
  this.container = details.container || details.Bucket;
  this.location = details.location || details.Location;

  // amazon appears to send the etag double enquoted
  this.etag = this.etag ? this.etag.replace(/"/g,'') : this.etag;
  // AWS Specific
  this.storageClass = details.StorageClass || this.StorageClass;
};

File.prototype.toJSON = function () {
  return _.pick(this, ['name', 'etag', 'size', 'storageClass', 'lastModified', 'container', 'location' ]);
};
