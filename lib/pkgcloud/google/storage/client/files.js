/*
 * files.js: Instance methods for working with files from Google Cloud Storage
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
  util = require('util'),
  pkgcloud = require('../../../../../lib/pkgcloud'),
  through = require('through2'),
  storage = pkgcloud.providers.google.storage,
  _ = require('underscore');

//
// ### function removeFile (container, file, callback)
// #### @container {string} Name of the container to destroy the file in
// #### @file {string} Name of the file to destroy.
// #### @callback {function} Continuation to respond to when complete.
// Destroys the `file` in the specified `container`.
//
exports.removeFile = function (container, file, callback) {
  var bucket = this._getBucket(container),
    file = this._getFile(bucket, file);

  file.delete(function(err) {
    return err
      ? callback(err)
      : callback(null, true);
  });
};

exports.upload = function (options) {
  var self = this,
    bucket = this._getBucket(options),
    file = this._getFile(bucket, options);

  // check for deprecated calling with a callback
  if (typeof arguments[arguments.length - 1] === 'function') {
    self.emit('log::warn', 'storage.upload no longer supports calling with a callback');
  }

  var proxyStream = through(),
    writableStream = file.createWriteStream();

  // we need a proxy stream so we can always return a file model
  // via the 'success' event
  writableStream.on('complete', function(file) {
    proxyStream.emit('success', new storage.File(self, file));
  });

  writableStream.on('error', function(err) {
    proxyStream.emit('error', err);
  });

  writableStream.on('data', function(chunk) {
    proxyStream.emit('data', chunk);
  });

  proxyStream.pipe(writableStream);

  return proxyStream;
};

exports.download = function (options) {
  var bucket = this._getBucket(options),
    file = this._getFile(bucket, options);

  return file.createReadStream(options);
};

exports.getFile = function (container, file, callback) {
  var self = this,
    bucket = this._getBucket(container),
    file = this._getFile(bucket, file);

  file.getMetadata(function(err, data) {
    return err
      ? callback(err)
      : callback(null, new storage.File(self, _.extend({ metadata: data }, {
      container: container
    })));
  });
};

exports.getFiles = function (container, options, callback) {
  var self = this,
    bucket = this._getBucket(container);

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  else if (!options) {
    options = {};
  }

  bucket.getFiles(options, function(err, files, nextQuery) {
    return err
      ? callback(err)
      : callback(null, files.map(function (file) {
      file.container = container;
      return new storage.File(self, file);
    }), nextQuery);
  });
};
