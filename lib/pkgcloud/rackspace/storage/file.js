/*
 * file.js: Rackspace Cloudfiles file (i.e. StorageObject)
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    base = require('../../core/storage/file');

var File = exports.File = function File(client, details) {
  base.File.call(this, client, details);
};

utile.inherits(File, base.File);

// Remark: Not fully implemented
File.prototype.addMetadata =  function (metadata, callback) {
  var newMetadata = clone(this.metadata);
  Object.keys(metadata).forEach(function (key) {
    newMetadata[key] = metadata[key];
  });

  var options = {
    uri: this.fullPath,
    method: 'POST',
    headers: this._createHeaders(newMetadata)
  };

  common.rackspace(options, callback, function (body, res) {
    this.metadata = newMetadata;
    callback(null, true);
  });
};

// Remark: This method is untested
File.prototype.copy = function (container, destination, callback) {
  var copyOptions = {
    method: 'PUT',
    uri: this.fullPath,
    headers: {
      'X-COPY-DESTINATION': [container, destination].join('/'),
      'CONTENT-LENGTH': this.bytes
    }
  };

  common.rackspace(copyOptions, callback, function (body, res) {
    callback(null, true);
  });
};

File.prototype._setProperties = function (details) {
  var self = this;

  this.metadata = {};
  this.container = details.container || null;
  this.name = details.name || null;
  this.etag = details.etag || null;
  this.contentType = details['content-type'] || null;


  this.lastModified = details['last-modified']
    ? new Date(details['last-modified'])
    : null;

  this.size = this.bytes = details['content-length']
    ? parseInt(details['content-length'], 10)
    : null;

  Object.keys(details).forEach(function (header) {
    var match;
    if (match = header.match(/x-object-meta-(\w+)/i)) {
      self.metadata[match[1]] = details[header];
    }
  });
};

File.prototype._createHeaders = function (metadata) {
  var headers = {};
  Object.keys(metadata).forEach(function (key) {
    var header = "x-object-meta-" + key;
    headers[header] = metadata[key];
  });

  return headers;
};
