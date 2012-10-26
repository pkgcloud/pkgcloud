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
// ### function _getDetails (details, callback)
// #### @details {Object} Short details of server
// #### @callback {function} f(err, details) Amended short details.
//
// Loads IP and name of server.
//
exports._getDetails = function getDetails(details, callback) {
  var self = this;

  async.parallel([
    function getName(callback) {
      self.query(
        'DescribeInstanceAttribute',
        { InstanceId: details.instanceId, Attribute: 'userData' },
        callback,
        function (body, res) {
          var meta = new Buffer(
            body.userData.value || '',
            'base64'
          ).toString();

          try {
            meta = JSON.parse(meta);
          } catch (e) {
            meta = {};
          }

          details.name = meta.name;
          callback(null);
        }
      );
    }
  ], function () {
    callback(null, details);
  });
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
    self = this;

  az.getServer(server, function(err, result) {
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

  var server = new azureServer.AzureServer(this.config),
    self = this;

  server.createServer(options, function(err, res) {
    if(err) {
      callback(err)
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
  var serverId = server instanceof base.Server ? server.id : server;
  var server = new azureServer.AzureServer(this.config);
  server.destroyServer(server, function(err) {
    if(err) {
      callback(err)
    } else {
      callback(null, {ok: serverId}, res);
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
  var serverId = server instanceof base.Server ? server.id : server;

  return this.query(
    'RebootInstances',
    { InstanceId: serverId },
    callback,
    function (body, res) {
      callback(null, { ok: serverId }, res);
    }
  );
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
