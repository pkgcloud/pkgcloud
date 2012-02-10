/*
 * servers.js: Instance methods for working with servers from Joyent Cloud
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */
var request = require('request'),
    base = require('../../../core/compute'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    compute = pkgcloud.providers.joyent.compute;

// ### function getVersion (callback) 
//
// Gets the current API version
//
// #### @callback {function} f(err, version).
//
exports.getVersion = function getVersion(callback) {
  this.request(this.config.account + '/datacenters', callback,
    function (_, res) {
      callback(null, res.headers['x-api-version']);
  });
};

// ### function getLimits (callback) 
//
// Gets the current API version
//
// #### @callback {function} f(err, version).
//
exports.getLimits = function getLimits(callback) {
  callback(new Error("Joyent's API is not limited"));
};

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
// #### @callback {Function} f(err, servers).
//
exports.getServers = function getServers(opts,callback) {
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
exports.createServer = function createServer(opts, callback) {
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

  if(opts.name)     { joyentOpts.name = opts.name; }
  if(opts.metadata) { joyentOpts.metadata = opts.metadata; }
  if(opts.tag)      { joyentOpts.tag = opts.tag; }


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

// ### function destroyServer(server, callback) 
//
// Destroy a server in Joyent.
//
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
exports.destroyServer = function destroyServer(server, callback) {
  var self       = this,
      serverId   = server instanceof base.Server ? server.id : server;

  var createOptions = {
    method: 'DELETE',
    path: this.config.account + '/machines/' + serverId
  };

  this.request(createOptions, callback, function () {
    callback(null, {deleted: serverId});
  });
};

// ### function renameServer(server, name, callback) 
//
// Renames a server
//
// #### @server {Server|String} Server id or a server
// #### @name   {String} New name to apply to the server
// #### @callback {Function} f(err, server).
//
exports.renameServer = function renameServer(server, name, callback) {
  callback(new Error('Not supported by joyent'));
};

// ### function rebootServer(server, type, callback) 
//
// reboots a server
//
// #### @server {Server|String} Server id or a server
// #### @type   {String} Soft or hard reboot, ignored in joyent
// #### @callback {Function} f(err, serverId).
//
exports.rebootServer = function rebootServer(server, type, callback) {
  if (!callback && typeof type === 'function') {
    callback = type;
    type = 'soft'; 
  }
  
  var serverId = server instanceof base.Server ? server.id : server;

  var createOptions = {
    method: 'POST',
    path: this.config.account + '/machines/' + serverId + '?action=reboot'
  };

  this.request(createOptions, callback, function (body) {
    callback(null, {reboot: serverId});
  });
};

