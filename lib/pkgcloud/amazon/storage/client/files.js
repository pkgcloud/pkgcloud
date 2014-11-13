/*
 * files.js: Instance methods for working with files from AWS S3
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    request = require('request'),
    util = require('util'),
    base = require('../../../core/storage'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    through = require('through2'),
    storage = pkgcloud.providers.amazon.storage,
    _ = require('underscore');

//
// ### function removeFile (container, file, callback)
// #### @container {string} Name of the container to destroy the file in
// #### @file {string} Name of the file to destroy.
// #### @callback {function} Continuation to respond to when complete.
// Destroys the `file` in the specified `container`.
//
exports.removeFile = function (container, file, callback) {
  var self = this;

  if (container instanceof storage.Container) {
    container = container.name;
  }

  if (file instanceof storage.File) {
    file = file.name;
  }

  self.s3.deleteObject({
    Bucket: container,
    Key: file
  }, function(err, data) {
    return err
      ? callback(err)
      : callback(null, !!data.DeleteMarker);
  });
};

exports.upload = function (options) {
  var self = this;

  // check for deprecated calling with a callback
  if (typeof arguments[arguments.length - 1] === 'function') {
    self.emit('log::warn', 'storage.upload no longer supports calling with a callback');
  }

  var s3Options = {
    Bucket: options.container instanceof base.Container ? options.container.name : options.container,
    Key: options.remote instanceof base.File ? options.remote.name : options.remote
  };

  if (options.contentType) {
    s3Options.ContentType = options.contentType;
  }

  // use ACL until a more obvious permission generalization is available
  if (options.acl) {
    s3Options.ACL = options.acl;
  }

  var proxyStream = through(),
    writableStream = self.s3Stream.upload(s3Options);

  // we need a proxy stream so we can always return a file model
  // via the 'success' event
  writableStream.on('uploaded', function(details) {
    proxyStream.emit('success', new storage.File(self, details));
  });

  writableStream.on('error', function(err) {
    proxyStream.emit('error', err);
  });

  writableStream.on('data', function (chunk) {
    proxyStream.emit('data', chunk);
  });

  proxyStream.pipe(writableStream);

  return proxyStream;
};

exports.download = function (options) {
  var self = this;

  return self.s3.getObject({
    Bucket: options.container instanceof base.Container ? options.container.name : options.container,
    Key: options.remote instanceof base.File ? options.remote.name : options.remote
  }).createReadStream();

};

exports.getFile = function (container, file, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
      self = this;

  self.s3.headObject({
    Bucket: containerName,
    Key: file
  }, function(err, data) {
    return err
      ? callback(err)
      : callback(null, new storage.File(self, _.extend(data, {
      container: container,
      name: file
    })));
  });
};

exports.getFiles = function (container, options, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
      self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  else if (!options) {
    options = {};
  }

  var s3Options = {
    Bucket: containerName
  };

  if (options.marker) {
    s3Options.Marker = options.marker;
  }

  if (options.prefix) {
    s3Options.Prefix = options.prefix;
  }

  if (options.maxKeys) {
    s3Options.MaxKeys = options.maxKeys
  }

  self.s3.listObjects(s3Options, function(err, data) {
    return err
      ? callback(err)
      : callback(null, self._toArray(data.Contents).map(function (file) {
      file.container = container;
      return new storage.File(self, file);
    }), {
      isTruncated: data.IsTruncated,
      marker: data.Marker,
      nextMarker: data.NextMarker
    });
  });
};

