/*
 * containers.js: Instance methods for working with containers from AWS S3
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var async = require('async'),
    request = require('request'),
    base = require('../../../core/storage'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    storage = pkgcloud.providers.amazon.storage;

//
// ### function getContainers (callback)
// #### @callback {function} Continuation to respond to when complete.
// Gets all Rackspace Cloudfiles containers for this instance.
//
exports.getContainers = function (callback) {
  var self = this;

  this.xmlRequest([''], callback, function (body) {
    var containers = self._toArray(body.Buckets.Bucket);

    containers = containers.map(function (container) {
      return new (storage.Container)(self, container);
    });

    callback(null, containers);
  });
};

//
// ### function getContainer (container, callback)
// #### @container {string|storage.Container} Name of the container to return
// #### @callback {function} Continuation to respond to when complete.
// Responds with the Rackspace Cloudfiles container for the specified
// `container`.
//
exports.getContainer = function (container, callback) {
  var containerName = container instanceof storage.Container ? container.name : container,
      self = this,
      options;

  this.xmlRequest([containerName], callback, function (body, res) {
    callback(null, new (storage.Container)(self, body));
  });
};

//
// ### function createContainer (container, callback)
// #### @container {string|Container} Container to create in Rackspace Cloudfiles.
// #### @callback {function} Continuation to respond to when complete.
// Creates the specified `container` in the Rackspace Cloudfiles associated
// with this instance.
//
exports.createContainer = function (container, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
      self = this;

  this.xmlRequest('PUT', [containerName], callback, function (body, res) {
    callback(null, new (storage.Container)(self, container));
  });
};

//
// ### function destroyContainer (container, callback)
// #### @container {string} Name of the container to destroy
// #### @callback {function} Continuation to respond to when complete.
// Destroys the specified `container` and all files in it.
//
exports.destroyContainer = function (container, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
      self = this;

  this.getFiles(containerName, false, function (err, files) {
    if (err) {
      return callback(err);
    }

    function deleteContainer (err) {
      if (err) {
        return callback(err);
      }

      self.xmlRequest(
        'DELETE',
        [containerName],
        callback,
        function (body, res) {
          callback(null, res.statusCode == 204);
        }
      );
    }

    function destroyFile (file, next) {
      file.remove(next);
    }

    if (files.length === 0) {
      return deleteContainer();
    }

    async.forEach(files, destroyFile, deleteContainer);
  });
};
