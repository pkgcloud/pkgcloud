/*
 * containers.js: Instance methods for working with containers from Azure
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var async = require('async'),
    request = require('request'),
    base = require('../../../core/storage'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    storage = pkgcloud.providers.azure.storage;

//
// ### function getContainers (callback)
// #### @callback {function} Continuation to respond to when complete.
// Gets all Rackspace Cloudfiles containers for this instance.
//
exports.getContainers = function (callback) {
  var self = this;

  this.xmlRequest('GET',['','?comp=list'], callback, function (body) {
    var containers = self._toArray(body.Containers.Container);

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

  this.xmlRequest('GET', [containerName,'?restype=container'], callback, function (body, res) {
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
// From Azure docs:
// A container that was recently deleted cannot be recreated until all of
// its blobs are deleted. Depending on how much data was stored within the container,
// complete deletion can take seconds or minutes. If you try to create a container
// of the same name during this cleanup period, your call returns an error immediately.
//
exports.createContainer = function (container, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
      self = this;

  this.xmlRequest('PUT', [containerName,'?restype=container'], callback, function (body, res) {
    callback(null, new (storage.Container)(self, container));
  });
};

//
// ### function destroyContainer (container, callback)
// #### @container {string} Name of the container to destroy
// #### @callback {function} Continuation to respond to when complete.
// Destroys the specified `container` and all files in it.
// From Azure docs:
// A container that was recently deleted cannot be recreated until all of
// its blobs are deleted. Depending on how much data was stored within the container,
// complete deletion can take seconds or minutes. If you try to create a container
// of the same name during this cleanup period, your call returns an error immediately.
//
exports.destroyContainer = function (container, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
      self = this;

  this.xmlRequest('DELETE', [containerName,'?restype=container'], callback, function (body, res) {
     callback(null, res.statusCode == 202);
   });

};
