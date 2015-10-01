/*
 * files.js: Instance methods for working with files from Google Cloud Storage
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var pkgcloud = require('../../../../../lib/pkgcloud'),
  through = require('through2'),
  storage = pkgcloud.providers.google.storage,
  _ = require('underscore');

/**
 * Destroy a file in the specified container.
 *
 * @param {string} container - Name of the container to destroy the file in.
 * @param {string} file - Name of the file to destroy.
 * @param {function} callback - Continuation to respond to when complete.
 */
exports.removeFile = function (container, file, callback) {
  var bucket = this._getBucket(container),
    file = this._getFile(bucket, file);

  file.delete(function(err) {
    return err
      ? callback(err)
      : callback(null, true);
  });
};

/**
 * Upload a file to the specified bucket.
 *
 * @param {object} options - Configuration object.
 * @param {object} options.container - Container object for the file.
 * @param {object|string} options.file - The file to upload content to.
 * @return {stream}
 */
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
  writableStream.on('complete', function() {
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

/**
 * Download a file from the specified bucket.
 *
 * @param {object} options - Configuration object.
 * @param {object} options.container - Container object for the file.
 * @param {object|string} options.file - The file to upload content to.
 * @return {stream}
 */
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

/**
 * Get all of the files from a gcloud bucket.
 *
 * @param {object} container - Container object for the file.
 * @param {object=|function} options - Options or callback.
 * @param {string} options.maxResults - Maximum amount of results to fetch.
 * @param {function} callback - Continuation to respond to when complete.
 */
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
