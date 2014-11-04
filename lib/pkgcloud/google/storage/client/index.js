/*
 * client.js: Storage client for Google Cloud Storage
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var util = require('util'),
  google = require('../../client'),
  _ = require('underscore'),
  pkgcloud = require('../../../../../lib/pkgcloud');

var Client = exports.Client = function (options) {
  google.Client.call(this, options);

  _.extend(this, require('./containers'));
  _.extend(this, require('./files'));

  this.storage = this.gcloud.storage(options);
};

util.inherits(Client, google.Client);

//
// Return a gcloud Bucket instance, after detecting its name from a variety of
// parameter types.
//
Client.prototype._getBucket = function (container) {
  container = container.container || container;

  var containerName,
    storage = pkgcloud.providers.google.storage;

  if (typeof container === 'string') {
    containerName = container;
  }

  if (container instanceof storage.Container) {
    containerName = container.name;
  }

  return this.storage.bucket(containerName || container);
};

//
// Return a gcloud File instance, after detecting its name from a variety of
// parameter types.
//
Client.prototype._getFile = function (bucket, file) {
  file = file.file || file;

  var fileName,
    storage = pkgcloud.providers.google.storage;

  if (typeof file === 'string') {
    fileName = file;
  }

  if (file instanceof storage.File) {
    fileName = file.name;
  }

  return bucket.file(fileName || file);
};
