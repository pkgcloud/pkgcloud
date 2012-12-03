/*
 * containers.js: Instance methods for working with containers from Rackspace Cloudfiles
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var async = require('async'),
    request = require('request'),
    base = require('../../../core/storage'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    storage = pkgcloud.providers.rackspace.storage;

//
// ### function getContainers (callback)
// #### @callback {function} Continuation to respond to when complete.
// Gets all Rackspace Cloudfiles containers for this instance.
//
exports.getContainers = function (callback) {
  var self = this;

  this.request({ path: [true] }, callback, function (body) {
    callback(null, body.map(function (container) {
      //
      // The cdn properties are normaly set in response headers
      // when requesting single cdn containers
      //
      container.cdnEnabled = container.cdn_enabled == 'true';
      container.logRetention = container.log_retention == 'true';
      container.cdnUri = container.cdn_uri;
      container.cdnSslUri = container.cdn_ssl_uri;

      return new storage.Container(self, container);
    }));
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
      self = this;

  this.request('HEAD', containerName, callback, function (body, res) {
    container = {
      name: containerName,
      count: parseInt(res.headers['x-container-object-count'], 10),
      bytes: parseInt(res.headers['x-container-bytes-used'], 10)
    };

    container.cdnUri = res.headers['x-cdn-uri'];
    container.cdnSslUri = res.headers['x-cdn-ssl-uri'];
    container.cdnEnabled = res.headers['x-cdn-enabled'] == 'true';
    container.ttl = parseInt(res.headers['x-ttl'], 10);
    container.logRetention = res.headers['x-log-retention'] == 'true';

    callback(null, new (storage.Container)(self, container));
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

  this.request('PUT', containerName, callback, function (body, res) {
    callback(null, new (storage.Container)(self, {name: containerName}));
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

  this.getFiles(container, function (err, files) {
    if (err) {
      return callback(err);
    }

    function deleteContainer (err) {
      if (err) {
        return callback(err);
      }

      self.request('DELETE', containerName, callback, callback.bind(null, null, true));
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
