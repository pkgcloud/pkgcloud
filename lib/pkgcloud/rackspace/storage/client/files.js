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
    utile = require('utile'),
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
  this.request('DELETE'
    ,[container instanceof base.Container ? container.name : container, file]
    ,callback
    ,callback.bind(null, null, true)
  );
};

exports.upload = function (options, callback) {
  if (typeof options === 'function' && !callback) {
    callback = options;
    options = {};
  }

  var container = options.container,
      rstream,
      lstream;

  if (container instanceof storage.Container) {
    container = container.name;
  }

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
    upload: true,
    path: [container, options.remote],
    headers: options.headers || {}
  }, callback, function (body, res) {
    callback(null, true, res);
  });

  if (lstream) {
    lstream.pipe(rstream);
  }

  return rstream;
};

exports.download = function (options, callback) {
  var self = this,
      container = options.container,
      lstream,
      rstream;

  if (container instanceof storage.Container) {
    container = container.name;
  }

  if (options.local) {
    lstream = filed(options.local);
  }
  else if (options.stream) {
    lstream = options.stream;
  }

  rstream = this.request({
    path: [container, options.remote],
    download: true
  }, callback, function (body, res) {
    callback(null, new (storage.File)(self, utile.mixin(res.headers, {
      container: container,
      name: options.remote
    })));
  });

  if (lstream) {
    rstream.pipe(lstream);
  }

  return rstream;
};

exports.getFile = function (container, file, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
      self = this;

  this.request({
    method: 'HEAD',
    path: [containerName, file, true ]
  }, callback, function (body, res) {
    callback(null, new storage.File(self, utile.mixin(res.headers, {
      container: container,
      name: file
    })));
  });
};

exports.getFiles = function (container, download, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
      self = this;

  if (typeof download == 'function' && !(download instanceof RegExp)) {
    callback = download;
    download = false;
  }

  this.request({ path: [containerName, true] }, callback, function (body, res) {
    callback(null, body.map(function (file) {
      file.container = container;
      return new storage.File(self, file);
    }));
  });
};

