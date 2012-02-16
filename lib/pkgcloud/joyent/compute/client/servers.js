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
  return this.request(this.account + '/datacenters', callback,
    function (_, response,res) {
      callback(null, response.headers['x-api-version'],res);
  });
};

// ### function getLimits (callback) 
//
// Gets the current API limits
//
// #### @callback {function} f(err, version).
//
exports.getLimits = function getLimits(callback) {
  return err("Joyent's API is not rate limited", callback);
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
  return this.request(this.account + '/machines', callback, 
    function (body,res) { callback(null, body.map(function (result) {
        return new compute.Server(self, result);
      }),res);
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
        path   : this.account + '/machines',
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
      ? options.flavor.id : options.flavor;
    delete options.flavor;
  }
  if (options.image) {
    createOptions.body.dataset = 
      options.image instanceof base.Image ? options.image.id  : options.image;
    delete options.image;
  }
  return this.request(createOptions, callback, function (body,res) {
    callback(null, new compute.Server(self, body),res);
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
    path: this.account + '/machines/' + serverId
  };

  return this.request(destroyOptions, callback, function (body,res) {
    callback(null, {ok: serverId},res);
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

  return this.request(this.account + '/machines/' + serverId, callback,
    function (body,res) { callback(null, new compute.Server(self, body),res);
  });
};



// ### function rebootServer (server, options, callback) 
//
// Reboots a server
//
// #### @server      {Server|String} The server to reboot
// #### @callback {Function} f(err, server).
exports.rebootServer = function rebootServer(server, callback) {
  var serverId = server instanceof base.Server ? server.id : server;
  var createOptions = {
    method: 'POST',
    path: this.account + '/machines/' + serverId + '?action=reboot'
  };
  return this.request(createOptions, callback, function (body,res) {
    callback(null, {ok: serverId},res);
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

