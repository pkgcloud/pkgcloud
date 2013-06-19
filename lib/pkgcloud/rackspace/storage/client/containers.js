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
    _ = require('underscore'),
    storage = pkgcloud.providers.rackspace.storage;

//
// ### function getContainers (callback)
// #### @options {object} Options for the getContainers call
// #### @callback {function} Continuation to respond to when complete.
// Gets all Rackspace Cloudfiles containers for this instance.
//
exports.getContainers = function (options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var getContainerOpts = {
    path: '',
    qs: {
      format: 'json'
    }
  };

  if (options.limit) {
    getContainerOpts.qs.limit = options.limit;
  }

  if (options.marker) {
    getContainerOpts.qs.marker = options.marker;
  }

  this.request(getContainerOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    else if (!body || !(body instanceof Array)) {
      return new Error('Malformed API Response')
    }

    if (!options.loadCDNAttributes) {
      return callback(null, body.map(function (container) {
        return new storage.Container(self, container);
      }));
    }
    else {
      var containers = [];

      async.forEachLimit(body, 10, function(c, next) {
        var container = new storage.Container(self, c);

        containers.push(container);
        container.refreshCdnDetails(function(err) {
          if (err) {
            return next(err);
          }
          next();
        })
      }, function(err) {
        callback(err, containers);
      });
    }
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

  this.request({
    method: 'HEAD',
    container: containerName
  }, function (err, body, res) {
    if (err) {
      return callback(err);
    }

    self._getCdnContainerDetails(containerName, function(err, details) {
      if (err) {
        return callback(err);
      }

      container = _.extend({}, details, {
        name: containerName,
        count: parseInt(res.headers['x-container-object-count'], 10),
        bytes: parseInt(res.headers['x-container-bytes-used'], 10)
      });

      container.metadata = self.deserializeMetadata(self.CONTAINER_META_PREFIX, res.headers);

      callback(null, new (storage.Container)(self, container));
    });
  });
};

//
// ### function createContainer (options, callback)
// #### @options {string|Container} Container to create in Rackspace Cloudfiles.
// #### @callback {function} Continuation to respond to when complete.
// Creates the specified `container` in the Rackspace Cloudfiles associated
// with this instance.
//
exports.createContainer = function (options, callback) {
  var containerName = typeof options === 'object' ? options.name : options,
      self = this;

  var createContainerOpts = {
    method: 'PUT',
    container: containerName
  };

  if (options.metadata) {
    createContainerOpts.headers = self.serializeMetadata(self.CONTAINER_META_PREFIX, options.metadata);
  }

  this.request(createContainerOpts, function (err) {
    return err
      ? callback(err)
      : callback(null, new (storage.Container)(self, { name: containerName, metadata: options.metadata }));
  });
};

//
// ### function updateContainerMetadata (container, callback)
// #### @container {Container} Container to update in Rackspace Cloudfiles.
// #### @callback {function} Continuation to respond to when complete.
// Updates the metadata in the specified `container` in the Rackspace Cloudfiles associated
// with this instance.
//
exports.updateContainerMetadata = function (container, callback) {
  this._updateContainerMetadata(container,
    this.serializeMetadata(this.CONTAINER_META_PREFIX, container.metadata),
    callback);
};

//
// ### function removeContainerMetadata (container, callback)
// #### @container {Container} Container to remove metadata from in Rackspace Cloudfiles.
// #### @metadataToRemove {object} object with keys representing metadata to remove
// #### @callback {function} Continuation to respond to when complete.
// Removes the provided `metadata` in the specified `container` in the Rackspace Cloudfiles associated
// with this instance.
//
exports.removeContainerMetadata = function (container, metadataToRemove, callback) {
  this._updateContainerMetadata(container,
    this.serializeMetadata(this.CONTAINER_REMOVE_META_PREFIX, metadataToRemove),
    callback);
};

//
// ### function _updateContainerMetadata (container, headers, callback)
// #### @container {Container} Container to update with provided header metadata in Rackspace Cloudfiles.
// #### @metadata {object} Raw headers to pass as part of the update call.
// #### @callback {function} Continuation to respond to when complete.
// Updates the specified `container` with the provided metadata `headers`in the Rackspace Cloudfiles associated
// with this instance.
//
exports._updateContainerMetadata = function(container, metadata, callback) {
  var self = this;

  if (!(container instanceof base.Container)) {
    throw new Error('Must update an existing container instance');
  }

  var updateContainerOpts = {
    method: 'POST',
    container: container.name,
    headers: metadata
  };

  this.request(updateContainerOpts, function (err) {

    // omit our newly deleted header fields, if any
    if (!err) {
      container.metadata = _.omit(container.metadata,
        _.keys(self.deserializeMetadata(self.CONTAINER_REMOVE_META_PREFIX, metadata)));
    }

    return err
      ? callback(err)
      : callback(null, container);
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

    function deleteContainer(err) {
      if (err) {
        return callback(err);
      }

      self.request({
        method: 'DELETE',
        container: containerName
      }, function(err) {
        return err
          ? callback(err)
          : callback(null, true);
      });
    }

    function destroyFile(file, next) {
      file.remove(next);
    }

    if (files.length === 0) {
      return deleteContainer();
    }

    async.forEach(files, destroyFile, deleteContainer);
  });
};
