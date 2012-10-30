/*
 * servers.js: Instance methods for working with servers from Azure Cloud
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */
var async = require('async'),
  request  = require('request'),
  Buffer = require('buffer').Buffer,
  base     = require('../../../core/compute'),
  pkgcloud = require('../../../../../lib/pkgcloud'),
  errs     = require('errs'),
  azure     = require('azure'),
  azureServer = require('./azure/azureServer.js'),
  compute  = pkgcloud.providers.azure.compute;


var getAzureServerInfo = function(server) {
  var serverInfo;

  if(server instanceof base.Server) {
    serverInfo = new azureServer.AzureServerInfo(server.serviceName, server.name, server.azure);
  } else {
    // we have just a server name
    serverInfo = server;
  }

  return serverInfo;
};

//
// ### function getVersion (callback)
// #### @callback {function} f(err, version).
//
// Gets the current API version
//
exports.getVersion = function getVersion(callback) {
  callback(null, this.version);
};

//
// ### function getLimits (callback)
// #### @callback {function} f(err, version).
//
// Gets the current API limits
//
exports.getLimits = function getLimits(callback) {
  return errs.handle(
    //TODO: is this correct?
    errs.create({ message: "Azure's API is not rate limited" }),
    callback
  );
};


//
// ### function getServers (callback)
// #### @callback {function} f(err, servers). `servers` is an array that
// represents the servers that are available to your account
//
// Lists all servers available to your account.
//
exports.getServers = function getServers(callback) {

  var az = new azureServer.AzureServer(this.config),
    self = this,
    servers = [];

  az.getServers(function(err, results) {
    if(err) {
      callback(err);
    } else {
      results.forEach(function(server) {
        servers.push(new compute.Server(self,server));
      });
      callback(null, servers);
    }
  });
};


//
// ### function getServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Gets a server in Azure.
//
exports.getServer = function getServer(server, callback) {

  var az = new azureServer.AzureServer(this.config),
    self = this,
    serverInfo = getAzureServerInfo(server);

  az.findServer(serverInfo, function(err, result) {
    if(err) {
      callback(err);
    } else {
      callback(null, new compute.Server(self,result));
    }
  });
};

//
// ### function createServer (options, callback)
// #### @opts {Object} **Optional** options
// ####    @name     {String} **Optional** the name of server
// ####    @image    {String|Image} the image (AMI) to use
// ####    @flavor   {String|Flavor} **Optional** flavor to use for this image
// #### @callback {Function} f(err, server).
//
// Creates a server with the specified options. The flavor
// properties of the options can be instances of Flavor
// OR ids to those entities in Azure.
//
exports.createServer = function createServer(options, callback) {

  var az = new azureServer.AzureServer(this.config),
    self = this;

  az.createServer(options, function(err, res) {
    if(err) {
      callback(err);
    } else {
      //console.dir(res);
      callback(null, new compute.Server(self, res));
    }
  });
};

//
// ### function destroyServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Destroy a server in Azure.
//
exports.destroyServer = function destroyServer(server, callback) {
  var serverId = server instanceof base.Server ? server.id : server,
    serverInfo = getAzureServerInfo(server);

  var az = new azureServer.AzureServer(this.config);
  az.destroyServer(serverInfo, function(err) {
    if(err) {
      callback(err);
    } else {
      callback(null, {ok: serverId});
    }
  });
};


//
// ### function rebootServer (server, options, callback)
// #### @server   {Server|String} The server to reboot
// #### @callback {Function} f(err, server).
//
// Reboots a server
//
exports.rebootServer = function rebootServer(server, callback) {
  var serverId = server instanceof base.Server ? server.id : server,
    serverInfo = getAzureServerInfo(server);

  var az = new azureServer.AzureServer(this.config);
  az.rebootServer(serverInfo, function(err) {
    if(err) {
      callback(err);
    } else {
      callback(null, {ok: serverId});
    }
  });
};

//
// ### function renameServer(server, name, callback)
// #### @server {Server|String} Server id or a server
// #### @name   {String} New name to apply to the server
// #### @callback {Function} f(err, server).
//
// Renames a server
//
exports.renameServer = function renameServer(server, name, callback) {
  return errs.handle(
    errs.create({ message: 'Not supported by AWS.' }),
    callback
  );
};
