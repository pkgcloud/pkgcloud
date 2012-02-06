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
// #### @callback {function} f(err, version).
//
exports.getServers = function (callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts     = null;
  }

  var self     = this,
      machines = [],
      cb       = function(err,result) {
        if(err) return callback(err);
        callback(null, 
          result.map(function (e) { return new compute.Server(self, e); }));
      };

  this.client.listMachines(function(err, obj, done) {
    if(err) return cb(err);
    cb(null,machines.concat(obj));
  });
};