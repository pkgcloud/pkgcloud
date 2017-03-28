/*
 * containers.js: Instance methods for working with containers from Google Cloud Storage
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var async = require('async'),
  pkgcloud = require('../../../../../lib/pkgcloud'),
  storage = pkgcloud.providers.google.storage;

/**
 * Get all Google Cloud Storage containers for this instance.
 *
 * @param {function} callback - Continuation to respond to when complete.
 */
exports.getContainers = function (callback) {
  var self = this,
    containers = [];

  function handleResponse(err, buckets, nextQuery) {
    if (err) {
      callback(err);
      return;
    }

    buckets.forEach(function(container) {
      containers.push(new (storage.Container)(self, container));
    });

    if (nextQuery) {
      self.storage.getBuckets(nextQuery, handleResponse);
      return;
    }

    callback(err, containers);
  }

  self.storage.getBuckets(handleResponse);
};

/**
 * Responds with the Google Cloud Storage bucket for the specified container.
 *
 * @param {string|storage.Container} container - The container to return.
 * @param {function} callback - Continuation to respond to when complete.
 */
exports.getContainer = function (container, callback) {
  var self = this,
    bucket = this._getBucket(container);

  bucket.getMetadata(function(err) {
    return err
      ? callback(err)
      : callback(null, new (storage.Container)(self, bucket));
  });
};

/**
 * Creates the specified `container` in the Google Cloud Storage account
 * associated with this instance.
 *
 * @param {string|storage.Container} container - The container to create.
 * @param {function} callback - Continuation to respond to when complete.
 */
exports.createContainer = function (options, callback) {
  var self = this,
    bucketName = this._getBucket(options).name;

  self.storage.createBucket(bucketName, function(err, bucket) {
    return err
      ? callback(err)
      : callback(null, new (storage.Container)(self, bucket));
  });
};

/**
 * Destroys the specified container and all files in it.
 *
 * @param {string|storage.Container} container - The container to destroy.
 * @param {function} callback - Continuation to respond to when complete.
 */
exports.destroyContainer = function (container, callback) {
  var bucket = this._getBucket(container);

  function deleteContainer() {
    bucket.delete(function(err) {
      return err
        ? callback(err)
        : callback(null, true);
    });
  }

  function handleResponse(err, files, nextQuery) {
    if (err) {
      return callback(err);
    }

    if (files.length > 0) {
      deleteFiles(files, function() {
        if (nextQuery) {
          bucket.getFiles(nextQuery, handleResponse);
        } else {
          deleteContainer();
        }
      });
    } else {
      deleteContainer();
    }
  }

  function deleteFiles(files, next) {
    async.forEachLimit(files, 10, destroyFile, next);
  }

  function destroyFile(file, next) {
    file.delete(next);
  }

  bucket.getFiles(handleResponse);
};
