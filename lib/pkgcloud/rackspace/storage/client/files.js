/*
 * files.js: Instance methods for working with files from Rackspace Cloudfiles
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    filed = require('filed'),
    mime = require('mime'),
    request = require('request'),
    base = require('../../../core/storage'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    storage = pkgcloud.providers.rackspace.storage;

//
// ### function removeFile (container, file, callback)
// #### @container {string} Name of the container to destroy the file in
// #### @file {string} Name of the file to destroy.
// #### @callback {function} Continuation to respond to when complete.
// Destroys the `file` in the specified `container`.
//
exports.removeFile = function (container, file, callback) {
  this.request('DELETE', [container, file], callback, function (body, res) {
    callback(null, true);
  });
};

exports.addFile = function (container, options, callback) {
  if (typeof options === 'function' && !callback) {
    callback = options;
    options = {};
  }

  var rstream,
      lstream;

  if (options.local) {
    lstream = filed(options.local);
    options.headers = options.headers || {};
    options.headers['content-length'] = fs.statSync(options.local).size;
  }
  else if (options.stream) {
    lstream = options.stream;
  }
  
  if (options.headers && !options.headers['content-type']) {
    options.headers['content-type'] = mime.lookup(options.remote);
  }
  
  rstream = this.request({
    method: 'PUT',
    path: [container, options.remote],
    headers: options.headers || {}
  }, callback, function (body, res) {
    callback(null, true);
  });
  
  if (lstream) {
    lstream.pipe(rstream);
  }
  
  return rstream;
};

exports.getFile = function (container, filename, callback) {
  var self = this, 
      containerPath = path.join(this.config.cache.path, container),
      cacheFile = path.join(containerPath, filename),
      options;
  
  common.statOrMkdirp(containerPath);
  
  var lstream = fs.createWriteStream(cacheFile),
      rstream,
      options;
      
  options = {
    method: 'GET', 
    client: self,
    uri: self.storageUrl(container, filename),
    download: lstream
  };

  rstream = common.rackspace(options, callback, function (body, res) {
    var file = {
      local: cacheFile,
      container: container,
      name: filename,
      bytes: res.headers['content-length'],
      etag: res.headers['etag'],
      last_modified: res.headers['last-modified'],
      content_type: res.headers['content-type']
    };

    callback(null, new (storage.File)(self, file));
  });
};

exports.getFiles = function (container, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
      self = this;

  this.request({ path: [container, true] }, callback, function (body, res) {
    callback(null, JSON.parse(body).map(function (file) {
      file.container = container;
      return new storage.File(self, file);
    }));
  });
};

