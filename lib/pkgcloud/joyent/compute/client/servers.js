/*
 * servers.js: Instance methods for working with servers from Joyent Cloud
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */
var base = require('../../../core/compute'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    compute = pkgcloud.providers.rackspace.compute;

// ### function getVersion (callback) 
//
// Gets the current API version
//
// #### @callback {function} f(err, version).
//
exports.getVersion = function (callback) {};

// ### function getServers (callback) 
//
// Gets the servers that are available for the logged in account
//
// #### @opts {Object} **Optional** An object literal 
// with joyent specific options.
// ####     @noCache {Boolean} **Optional** Tells smartdc not to cache
// #### @callback {function} f(err, version).
//
exports.getServers = function (opts, callback) {
  var self = this;

  if (typeof opts === 'function') {
    callback = opts;
    opts     = null;
  }

  var self = this,
      cb   = function(err,result) {
        if(err) return callback(err);
        callback(null, new compute.Server(self, result));
      };
console.log(this)
  this.client.listMachines(null, opts, function(err, obj, done) {
    if(err) return cb(err);
    console.log(obj,done)
  });
};