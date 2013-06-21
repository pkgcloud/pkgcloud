/*
 * cdn-containers.js: Instance methods for working with containers from Rackspace Cloudfiles
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
// ### function getCdnContainers (callback)
// #### @options {object} Options for the getCDNContainers call.
// #### @callback {function} Continuation to respond to when complete.
// Gets all Rackspace Cloudfiles CDN containers for this instance.
//
exports.getCdnContainers = function (options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var getContainerOpts = {
    path: '',
    serviceType: this.cdnServiceType,
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

  if (options.endMarker) {
    getContainerOpts.qs['end_marker'] = options.endMarker;
  }

  if (options.cdnOnly) {
    getContainerOpts.qs['enabled_only'] = options.cdnOnly;
  }

  this.request(getContainerOpts, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body.map(function (container) {
      //
      // The cdn properties are normally set in response headers
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
// ### function getCdnContainer (container, callback)
// #### @container {string|storage.Container} Name of the container to return
// #### @callback {function} Continuation to respond to when complete.
// Responds with the Rackspace Cloudfiles container for the specified
// `container`.
//
exports.getCdnContainer = function (container, callback) {
  var self = this;

  this._getCdnContainerDetails(container, function(err, details) {
    return err
      ? callback(err)
      : callback(null, new (storage.Container)(self, details));
  });
};

exports.setCdnEnabled = function (container, options, callback) {
  var self = this,
      containerName = container instanceof storage.Container ? container.name : container,
      enabled = typeof options === 'boolean' ? options : options.enabled;

  if (typeof options === 'function') {
    callback = options;
    options = {};
    enabled = true;
  }

  var cdnOpts = {
    method: 'PUT',
    container: containerName,
    serviceType: this.cdnServiceType,
    headers: {
      'x-cdn-enabled': enabled
    }
  };

  if (options.ttl) {
    cdnOpts.headers['x-ttl'] = options.ttl;
  }

  self.request(cdnOpts, function(err) {
    if (err) {
      return callback(err);
    }

    self.getContainer(containerName, function(err, container) {
      return err
        ? callback(err)
        : callback(err, container);
    });
  });
};

exports.updateCdnContainer = function (container, options, callback) {
  var self = this,
    containerName = container instanceof storage.Container ? container.name : container;

  var cdnOpts = {
    method: 'POST',
    container: containerName,
    serviceType: this.cdnServiceType,
    headers: {}
  };

  if (options.ttl) {
    cdnOpts.headers['x-ttl'] = options.ttl;
  }

  if (typeof options.enabled === 'boolean') {
    cdnOpts.headers['x-cdn-enabled'] = options.enabled;
  }

  if (typeof options.logRetention === 'boolean') {
    cdnOpts.headers['x-log-retention'] = options.logRetention;
  }

  self.request(cdnOpts, function (err) {
    if (err) {
      return callback(err);
    }

    self.getContainer(containerName, function (err, container) {
      return err
        ? callback(err)
        : callback(err, container);
    });
  });
};

// private function used to get the raw details for use in loading CDN attributes
// into existing container
exports._getCdnContainerDetails = function(container, callback) {
  var containerName = container instanceof storage.Container ? container.name : container,
    self = this;

  this.request({
    method: 'HEAD',
    container: containerName,
    serviceType: this.cdnServiceType
  }, function (err, body, res) {
    if (err && !(err.statusCode === 404)) {
      return callback(err);
    }
    else if (err) {
      return callback(null, {}); // return empty object
    }

    container = {
      name: containerName,
      count: parseInt(res.headers['x-container-object-count'], 10),
      bytes: parseInt(res.headers['x-container-bytes-used'], 10)
    };

    container.cdnUri = res.headers['x-cdn-uri'];
    container.cdnSslUri = res.headers['x-cdn-ssl-uri'];
    container.cdnEnabled = res.headers['x-cdn-enabled'] == 'True';
    container.cdnStreamingUri = res.headers['x-cdn-streaming-uri'];
    container.cdniOSUri = res.headers['x-cdn-ios-uri'];
    container.ttl = parseInt(res.headers['x-ttl'], 10);
    container.logRetention = res.headers['x-log-retention'] == 'True';

    container.metadata = self.deserializeMetadata(self.CONTAINER_META_PREFIX, res.headers);

    callback(null, container);
  });
};
