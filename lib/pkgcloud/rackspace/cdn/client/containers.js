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
// ### funtion getCOntainers (callback)
// #### @callback {function} Continuation to respond to when complete
// Gets all of the CDN Enabled Rackspace Cloudfiles containers for this
// instance
//
exports.getContainers = function getContainers (callback) {
  var self = this;

  this.request({ path: [true]}, callback, function (body) {
    callback(null, body.map(function (container) {
      console.log(container);
      container.cdnEnabled = container.cdn_enabled ;
      container.logRetention = container.log_retention;
      container.cdnUri = container.cdn_uri;
      container.cdnSslUri = container.cdn_ssl_uri;
      container.cdnIosUri = container.cdn_ios_uri;

      return new cdn.Container(self, container);
    }));
  });
};


