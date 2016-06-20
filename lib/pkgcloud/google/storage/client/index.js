/*
 * client.js: Storage client for Google Cloud Storage
 *
 * (C) 2011 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var util = require('util'),
  google = require('../../client'),
  _ = require('lodash'),
  pkgcloud = require('../../../../../lib/pkgcloud');

var Client = exports.Client = function (options) {
  google.Client.call(this, options);

  _.extend(this, require('./containers'));
  _.extend(this, require('./files'));

  this.storage = this.gcloud.storage(options);
};

util.inherits(Client, google.Client);

/**
 * Return a gcloud Bucket instance after detecting its name from a variety of
 * parameter types.
 *
 * @param {object|string} container - A descriptor for a gcloud Bucket.
 * @return {gcloud:bucket}
 */
Client.prototype._getBucket = function (container) {
  container = container.container || container;

  var storage = pkgcloud.providers.google.storage,
    containerName = container instanceof storage.Container ? container.name : container;

  return this.storage.bucket(containerName || container);
};

/**
 * Return a gcloud File instance after detecting its name from a variety of
 * parameter types.
 *
 * @param {gcloud:bucket} bucket - A gcloud Bucket instance, which contains the file.
 * @param {object|string} file - A descriptor for a gcloud File.
 * @return {gcloud:file}
 */
Client.prototype._getFile = function (bucket, file) {
  file = file.file || file.remote || file;

  var storage = pkgcloud.providers.google.storage,
    fileName = file instanceof storage.File ? file.name : file;

  return bucket.file(fileName || file);
};
