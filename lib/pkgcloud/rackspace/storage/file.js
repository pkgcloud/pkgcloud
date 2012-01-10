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

// Remark: Not fully implemented
File.prototype.getMetadata = function (callback) {
  common.rackspace('HEAD', this.fullPath, function (body, res) {
    var metadata = {};
    Object.keys(res.headers).forEach(function (header) {
      var match;
      if (match = header.match(/x-object-meta-(\w+)/i)) {
        metadata[match[1]] = res.headers[header];
      }
    });
    
    callback(null, metadata);
  });
};

// Remark: Not fully implemented
File.prototype.removeMetadata = function (keys, callback) {
  var newMetadata = {};
  Object.keys(this.metadata).forEach(function (key) {
    if (keys.indexOf(key) !== -1) {
      newMetadata[key] = this.metadata[key];
    }
  });
  
  // TODO: Finish writing this method
};

File.prototype._setProperties = function (details) {
  // TODO: Should probably take this in from details or something.
  this.metadata = {};
  
  this.container = details.container || null;
  this.name = details.name || null;
  this.etag = details.etag || null;
  this.hash = details.hash || null;
  this.bytes = details.bytes || null;
  this.local = details.local || null;
  this.contentType = details.content_type || null;
  this.lastModified = details.last_modified || null;
},

File.prototype._createHeaders = function (metadata) {
  var headers = {};
  Object.keys(metadata).forEach(function (key) {
    var header = "x-object-meta-" + key;
    headers[header] = metadata[key];
  });
  
  return headers;
};