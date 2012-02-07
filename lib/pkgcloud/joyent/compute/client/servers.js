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
// #### @opts {Object} **Optional** sets filtration/pagination:
// ####    @name    {String} **Optional** machines with this name.
// ####    @dataset {String} **Optional** machines with this dataset.
// ####    @package {String} **Optional** machines with this package.
// ####    @type    {String} **Optional** smartmachine or virtualmachine.
// ####    @state   {String} **Optional** machines in this state.
// ####    @memory  {Number} **Optional** machines with this memory.
// ####    @offset  {Number} **Optional** pagination starting point.
// ####    @limit   {Number} **Optional** cap on the number to return.
// #### @callback {Function} f(err, version).
//
exports.getServers = function (opts,callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts     = {};
  }

  var self     = this,
      machines = [],
      cb       = function(err,result) {
        if(err) { return callback(err); }
        callback(null, 
          result.map(function (e) { return new compute.Server(self, e); }));
      };

  function listMachines (opts) {
    self.client.listMachines(opts, function (err, obj, done) {
      if(err) { return cb(err); }
      if (typeof obj === 'object') { machines = machines.concat(obj); }
      cb(null,machines);
      //if(done) { cb(null,machines); }
      //else if(obj.length >= opts.limit) { cb(null,machines); }
      //else {
      //  opts.offset = opts.offset ? opts.offset + obj.length : obj.length;
      //  listMachines(opts);
      //}
    });
  }

  listMachines(opts);
};

exports.getImages = function (opts,callback) {
  var self     = this,
      cb       = function(err,result) {
        if(err) return callback(err);
        callback(null,
          result.map(function (e) { return new compute.Server(self, e); }));
      };

  this.client.listDatasets(function(err, obj, done) {
    if(err) return cb(err);
    cb(null,obj);
  });
};