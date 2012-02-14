/*
 * servers.js: Instance methods for working with servers from Joyent Cloud
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */
var request  = require('request'),
    base     = require('../../../core/compute'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    err      = require('../../../core/base/error').Err,
    compute = pkgcloud.providers.joyent.compute;

// ### function getVersion (callback) 
//
// Gets the current API version
//
// #### @callback {function} f(err, version).
//
exports.getVersion = function getVersion(callback) {
  return this.request(this.config.account + '/datacenters', callback,
    function (_, res) {
      callback(null, res.headers['x-api-version']);
  });
};

// ### function getLimits (callback) 
//
// Gets the current API limits
//
// #### @callback {function} f(err, version).
//
exports.getLimits = function getLimits(callback) {
  callback = callback || function(){};
  callback(new Error("Joyent's API is not limited"));
};

// ### function getServers (callback) 
//
// Lists all servers available to your account.
//
// #### @callback {function} f(err, servers). `servers` is an array that
// represents the servers that are available to your account
//
exports.getServers = function getServers(callback) {
  var self = this;
  return this.request(this.config.account + '/machines', callback, 
    function (body) { callback(null, body.map(function (result) {
        return new compute.Server(self, result);
      }));
    });
};

// ### function createServer (options, callback) 
//
// Creates a server with the specified options. The flavor
// properties of the options can be instances of Flavor
// OR ids to those entities in Joyent.
//
// #### @opts {Object} **Optional** options
// ####    @name     {String} **Optional** a name for your server
// ####    @flavor   {String|Favor} **Optional** flavor to use for this image
// ####    @image    {String|Image} **Optional** the image to use
// ####    @required {Boolean} **Optional** Validate if flavor, name,
// and image are present
// ####    @*        {*} **Optional** Anything platform specific
// #### @callback {Function} f(err, server).
//
exports.createServer = function createServer(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options  = {};
  }
  options    = options || {}; // no args

  var self = this,
      createOptions = { 
        method : 'POST',
        path   : this.config.account + '/machines',
        body   : options
      };

  ['flavor', 'image', 'name'].forEach(function (member) {
    if (options.required) { // marked as required?
      if(!options[member]) {
        err('options.' + required + ' is a required argument.', callback);
      }
    }
  });

  if (options.flavor) {
    createOptions.body["package"] = options.flavor instanceof base.Flavor
      ? options.flavor.id : parseInt(options.flavor, 10);
  }
  if (options.image) {
    createOptions.body.dataset = options.image instanceof base.Image
      ? options.image.id  : parseInt(options.image, 10);
  }

  return this.request(createOptions, callback, function (body) {
    callback(null, new compute.Server(self, body));
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
  var serverId = server instanceof base.Server ? server.id : server;

  var destroyOptions = {
    method: 'DELETE',
    path: this.config.account + '/machines/' + serverId
  };

  return this.request(destroyOptions, callback, function () {
    callback(null, {ok: serverId});
  });
};

// ### function getServer(server, callback) 
//
// Gets a server in Joyent.
//
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
exports.getServer = function getServer(server, callback) {
  var self       = this,
      serverId   = server instanceof base.Server ? server.id : server;

  var createOptions = {
    method: 'GET',
    path: this.config.account + '/machines/' + serverId
  };

  this.request(createOptions, callback, function (body) {
    var server = new compute.Server(self, body);
    callback(null, server);
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

