/*
 * containers.js: Instance methods for working with containers from Azure
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var async = require('async'),
  request = require('request'),
  base = require('../../../core/storage'),
  pkgcloud = require('../../../../../lib/pkgcloud'),
  azure = require('azure'),
  storage = pkgcloud.providers.azure.storage;

//
// ### function getContainers (callback)
// #### @callback {function} Continuation to respond to when complete.
// Gets all Rackspace Cloudfiles containers for this instance.
//
exports.getContainers = function (callback) {
  var self = this,
    results,
    blobClient = this._getBlobService();

  blobClient.listContainers(function(error, containers, nextMarker, response){
    if(!error){
      results = containers.map(function (container) {
        return new (storage.Container)(self, container.name);
      });
      callback(null, results);
    } else {
      callback(error);
    }
    blobClient = null;
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
  var containerName = storage.Container.getName(container),
    blobClient = this._getBlobService(),
    self = this;

  blobClient.getContainerProperties(containerName, function(error, container, response){
    if(!error){
      callback(null, new (storage.Container)(self, response));
    } else {
      callback(error);
    }
    blobClient = null;
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
  var containerName = storage.Container.getName(container),
    blobClient = this._getBlobService(),
    self = this;

  blobClient.createContainerIfNotExists(containerName, {publicAccessLevel : 'blob'}, function(error){
    if(!error){
      callback(null, new (storage.Container)(self, container));
    } else {
      callback(error);
    }
    blobClient = null;
  });
};

//
// ### function destroyContainer (container, callback)
// #### @container {string} Name of the container to destroy
// #### @callback {function} Continuation to respond to when complete.
// Destroys the specified `container` and all files in it.
//
exports.destroyContainer = function (container, callback) {
  var containerName = storage.Container.getName(container),
    blobClient = this._getBlobService(),
    self = this;

  blobClient.deleteContainer(containerName, function(error){
    if(!error){
      callback(null, new (storage.Container)(self, container));
    } else {
      callback(error);
    }
    blobClient = null;
  });
};
