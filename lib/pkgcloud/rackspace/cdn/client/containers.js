/*
 * containers.js Instance methods for working with containers from Rackspace Cloudfiles
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

var base = require('../../../core/storage'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    cdn = pkgcloud.providers.rackspace.cdn;

//
// ### funtion getContainers (callback)
// #### @callback {function} Continuation to respond to when complete
// Gets all of the CDN Enabled Rackspace Cloudfiles containers for this
// instance
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


