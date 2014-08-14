/*
 * container.js: AWS S3 File
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var util  = require('util'),
    base  = require('../../core/storage/file');

var File = exports.File = function File(client, details) {
  base.File.call(this, client, details);
};

util.inherits(File, base.File);

File.prototype._setProperties = function (details) {
  var self = this;

  this.name = details.name || details.Key;
  this.etag = details.ETag || details.etag || null;
  this.size = +(details.Size || details['content-length']) || 0;
  this.container = details.container;

  // amazon appears to send the etag double enquoted
  this.etag = this.etag ? this.etag.replace(/"/g,'') : this.etag;
  // AWS Specific
  this.storageClass = this.StorageClass;
};
