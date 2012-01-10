/*
 * containers.js: Instance methods for working with containers from Rackspace Cloudfiles
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var request = require('request'),
    base = require('../../../core/storage'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    storage = pkgcloud.providers.rackspace.storage;

//
// ### function getContainers ([cdn,] callback)
// #### @cdn {boolean} Value indicating if CDN containers should be returned
// #### @callback {function} Continuation to respond to when complete.
// Gets all Rackspace Cloudfiles containers for this instance.
//
exports.getContainers = function () {
  var self = this,
      args = Array.prototype.slice.call(arguments),
      callback = (typeof(args[args.length - 1]) === 'function') && args.pop(),
      isCdn = args.length > 0 && (typeof(args[args.length - 1]) === 'boolean') && args.pop(),
      url = isCdn ? this.cdnUrl(true) : this.storageUrl(true);

  common.rackspace(url, this, callback, function (body) {
    var results = [], 
        containers = JSON.parse(body);

    containers.forEach(function (container) {
      if (isCdn) {
        //
        // The cdn properties are normaly set in response headers
        // when requesting single cdn containers
        //
        container.cdnEnabled = container.cdn_enabled == "true";
        container.logRetention = container.log_retention == "true";
        container.cdnUri = container.cdn_uri;
        container.cdnSslUri = container.cdn_ssl_uri;
      }

      results.push(new (cloudfiles.Container)(self, container));
    });

    callback(null, results);
  });
};

//
// ### function getContainer (containerName, [cdn,] callback)
// #### @containerName {string} Name of the container to return
// #### @cdn {boolean} Value indicating if this is a CDN container.
// #### @callback {function} Continuation to respond to when complete.
// Responds with the Rackspace Cloudfiles container for the specified
// `containerName`.
//
exports.getContainer = function () {
  var self = this,
      args = Array.prototype.slice.call(arguments),
      callback = (typeof(args[args.length - 1]) === 'function') && args.pop(),
      isCdn = args.length > 0 && (typeof(args[args.length - 1]) === 'boolean') && args.pop(),
      containerName = args.pop(),
      containerOptions;
  
  containerOptions = {
    method: 'HEAD',
    uri: isCdn ? this.cdnUrl(containerName) : this.storageUrl(containerName),
    cdn: isCdn,
    client: this
  }
  
  common.rackspace(containerOptions, callback, function (body, res) {
    var container = {
      name: containerName,
      count: new Number(res.headers['x-container-object-count']),
      bytes: new Number(res.headers['x-container-bytes-used'])
    };
    
    if (isCdn) {
      container.cdnUri = res.headers['x-cdn-uri'];
      container.cdnSslUri = res.headers['x-cdn-ssl-uri'];
      container.cdnEnabled = res.headers['x-cdn-enabled'].toLowerCase() == "true";
      container.ttl = parseInt(res.headers['x-ttl']);
      container.logRetention = res.headers['x-log-retention'].toLowerCase() == "true";

      delete container.count;
      delete container.bytes;
    }
    
    callback(null, new (cloudfiles.Container)(self, container));
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
  var self = this, 
      containerName = container instanceof cloudfiles.Container ? container.name : container;
      
  common.rackspace('PUT', this.storageUrl(containerName), this, callback, function (body, res) {
    if (typeof container.cdnEnabled !== 'undefined' && container.cdnEnabled) {
      container.ttl = container.ttl || self.config.cdn.ttl;
      container.logRetention = container.logRetention || self.config.cdn.logRetention;
      
      var cdnOptions = {
        uri: self.cdnUrl(containerName),
        method: 'PUT',
        client: self,
        headers: {
          'X-TTL': container.ttl,
          'X-LOG-RETENTION': container.logRetention
        }
      };
      
      common.rackspace(cdnOptions, callback, function (body, res) {
        container.cdnUri = res.headers['x-cdn-uri'];
        container.cdnSslUri = res.headers['x-cdn-ssl-uri'];
        callback(null, new (cloudfiles.Container)(self, container));
      });
    }
    else {
      callback(null, new (cloudfiles.Container)(self, container));
    }
  });
};

//
// ### function destroyContainer (container, callback)
// #### @container {string} Name of the container to destroy
// #### @callback {function} Continuation to respond to when complete.
// Destroys the specified `container` and all files in it.
//
exports.destroyContainer = function (container, callback) {
  var self = this;
  this.getFiles(container, function (err, files) {
    if (err) {
      return callback(err);
    }
    
    function deleteContainer (err) {
      if (err) {
        return callback(err);
      }
      
      common.rackspace('DELETE', self.storageUrl(container), self, callback, function (body, res) {
        callback(null, true);
      });
    }
    
    function destroyFile (file, next) {
      file.destroy(next);
    }
    
    if (files.length === 0) {
      return deleteContainer();
    }
    
    async.forEach(files, destroyFile, deleteContainer);
  });
};