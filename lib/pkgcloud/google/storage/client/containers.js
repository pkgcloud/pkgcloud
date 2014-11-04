/*
 * containers.js: Instance methods for working with containers from Google Cloud Storage
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var async = require('async'),
  pkgcloud = require('../../../../../lib/pkgcloud'),
  storage = pkgcloud.providers.google.storage;

//
// ### function getContainers (callback)
// #### @callback {function} Continuation to respond to when complete.
// Gets all Google Cloud Storage containers for this instance.
//
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

//
// ### function getContainer (container, callback)
// #### @container {string|storage.Container} Name of the container to return
// #### @callback {function} Continuation to respond to when complete.
// Responds with the Google Cloud Storage bucket for the specified
// `container`.
//
exports.getContainer = function (container, callback) {
  var self = this,
    bucket = this._getBucket(container);

  bucket.getMetadata(function(err) {
    return err
      ? callback(err)
      : callback(null, new (storage.Container)(self, bucket));
  });
};

//
// ### function createContainer (options, callback)
// #### @options {string|Container} Container to create in Google Cloud Storage
// #### @callback {function} Continuation to respond to when complete.
// Creates the specified `container` in Google Cloud Storage account associated
// with this instance.
//
exports.createContainer = function (options, callback) {
  var self = this,
    bucketName = this._getBucket(options).name;

  self.storage.createBucket(bucketName, function(err, bucket) {
    return err
      ? callback(err)
      : callback(null, new (storage.Container)(self, bucket));
  });
};

//
// ### function destroyContainer (container, callback)
// #### @container {string} Name of the container to destroy
// #### @callback {function} Continuation to respond to when complete.
// Destroys the specified `container` and all files in it.
//
exports.destroyContainer = function (container, callback) {
  var self = this,
    bucket = this._getBucket(container);

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
