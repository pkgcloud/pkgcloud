/*
 * servers.js: Instance methods for working with servers from Joyent Cloud
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */
var base = require('../../../core/compute'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    compute = pkgcloud.providers.joyent.compute;

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
  var self = this;

  if (typeof opts === 'function') {
    callback = opts;
    opts     = {};
  }

  this.request('GET', this.config.account + '/machines', opts, callback, 
    function (body) {
      try {
        callback(null, JSON.parse(body).map(function (result) {
          return new compute.Server(self, result);
        }));
      } catch (e) { callback(e); }
    });
};

// ### function createServer (opts, callback) 
//
// Creates a server with the specified options. The flavor
// properties of the options can be instances of Flavor
// OR ids to those entities in Joyent.
//
// #### @opts {Object} **Optional** options
// ####    @flavor  {String|Favor} **Optional** flavor to use for this image
// ####    @name    {String} **Optional** a name for your server
// ####    @image   {String} **Optional** the image to use
// #### @callback {Function} f(err, server).
//
exports.createServer = function (opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts     = {};
  }

  var joyentOpts = {}
    , self       = this
    ;

  if(opts.flavor) {
    joyentOpts["package"] = opts.flavor instanceof base.Flavor
                        ? opts.flavor.id 
                        : opts.flavor;
  }

  if(opts.image) {
    joyentOpts.dataset  = opts.image instanceof base.Image
                        ? opts.image.id 
                        : opts.image;
  }

  if(opts.name) { joyentOpts.name = opts.name; }

  var createOptions = {
    method: 'POST',
    path: this.config.account + '/machines',
    body: joyentOpts
  };

  this.request(createOptions, callback, function (body) {
    var server = new compute.Server(self, body);
    callback(null, server);
  });
};

// ### function destroyServer(opts, callback) 
//
// Destroy a server in Joyent.
//
// #### @id {Object|String} **Optional** specifies name
// ####    @name    {String} **Optional** a name for your server
// #### @callback {Function} f(err, server).
//
exports.destroyServer = function (id, callback) {
  if(typeof id === 'object') { id = id.name; }

  var self       = this;

  self.client.deleteMachine(id, function (err, server) {
    if (err) { return callback(err); }
    callback(null, new compute.Server(self, server));
  });
};