/*
 * containers.js Instance methods for working with containers from Rackspace Cloudfiles
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

var base = require('../../../core/storage'),
    async = require('async'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    cdn = pkgcloud.providers.rackspace.cdn;

//
// ### funtion getContainers (callback)
// #### @callback {function} Continuation to respond to when complete
// Gets all of the CDN Enabled Rackspace Cloudfiles containers for this instance
//
exports.getContainers = function getContainers (callback) {
  var self = this;

  this.request({ path: [true]}, callback, function (body) {
    callback(null, body.map(function (container) {
      console.log(container);
      container.cdnEnabled = container.cdn_enabled;
      container.logRetention = container.log_retention;
      container.cdnUri = container.cdn_uri;
      container.cdnSslUri = container.cdn_ssl_uri;
      container.cdnIosUri = container.cdn_ios_uri;

      return new cdn.Container(self, container);
    }));
  });
};

//
// ### function getContainer (container, callback)
// #### @container {string|cdn.Container} Name of the container to return
// #### @callback {function} Continuation to respond when complete
// Responds with the CDN Enabled Rackspace Cloudfiles container for specified `container`
//
exports.getContainer = function getContainer(container, callback) {
  var containerName = container instanceof cdn.Container ? container.name : container,
      self = this;

  this.request('HEAD', containerName, callback, function (body, res) {
    console.log(res);
    container = {
      name: containerName
    };

    container.cdnUri = res.headers['x-cdn-uri'];
    container.cdnSslUri = res.headers['x-cdn-ssl-uri'];
    container.cdnIosUri = res.headers['x-cdn-ios-uri'];
    container.cdnEnabled = res.headers['x-cdn-enabled'] == 'True';
    container.ttl = parseInt(res.headers['x-ttl'], 10);
    container.logRetention = res.headers['x-log-retention'] == 'True';

    callback(null, new (cdn.Container)(self, container));
  });
};

//
// ### function createContainer (container, callback);
// #### @container {string|Container} Container to create
// #### @callback {function} Continuation to respond to when complete.
// Creates a CDN Enabled `container` in Rackspace Cloudfiles associated with
// this instance
//
exports.createContainer = function (container, callback) {
  var containerName = container instanceof cdn.Container ? container.name : container,
      self = this;
  // Have to manually call auth here in order to pull the storageUrl from the
  // client config. All the config urls are loaded on auth
  if(this.authorized) {
    request();
  }
  else {
    this.auth(request);
  }
  function request () {
    var createOptions = {
      method: 'PUT',
      url: self.serviceUrl.apply(self, ['storage', containerName])
    };
    self.request(createOptions, callback, function (body, res) {
      var cdnOptions = {
        method: 'PUT',
        path: containerName,
        headers: {
          'X-TTL': 259200,
          'X-CDN-Enabled': true
        }
      };
      self.request(cdnOptions, callback, function (body, res) {
        console.log(res.headers);
        container = {
          name: containerName
        };
        container.cdnUri = res.headers['x-cdn-uri'];
        container.cdnSslUri = res.headers['x-cdn-ssl-uri'];
        container.cdnIosUri = res.headers['x-cdn-ios-uri'];
        container.cdnEnabled = true;
        container.ttl = 259200;
        container.logRetention = res.headers['x-log-retention'] == 'True';

        callback(null, new (cdn.Container)(self, container));
      });
    });
  }
};

//
// ### function destroyContainer (container, callback)
// #### @container {string} Name of the container to destroy
// #### @callback {function} Continuation to respond to when complete.
// Destroys the specified `container` and all files in it.
//
exports.destroyContainer = function (container, callback) {
  var containerName = container instanceof cdn.Container ? container.name : container,
      self = this;

  this.getFiles(container, function (err, files) {
    if (err) {
      return callback(err);
    }
    function deleteContainer (err) {
      if (err) {
        return callback(err);
      }

      var options = {
        method: 'DELETE',
        url: self.serviceUrl.apply(self, ['storage', containerName])
      };

      self.request(options, callback, callback.bind(null, null, true));
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
