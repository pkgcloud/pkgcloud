/*
 * servers.js: Instance methods for working with servers from Azure Cloud
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */
var async = require('async');
var errs = require('errs');
var ComputeManagementClient = require('azure-arm-compute');

var constants = require('../../constants');

/**
 * Gets the current API version
 * @param {function} callback cb(err, version).
 */
function getVersion(callback) {
  callback(null, constants.MANAGEMENT_API_VERSION);
};

/**
 * Gets the current API limits
 * @param {function} callback - cb(err, version).
 */
function getLimits(callback) {
  return errs.handle(
    errs.create({ message: 'Azure\'s API is not rate limited' }),
    callback
  );
};

/**
 * Lists all servers available to your account.
 * @param {function} callback - cb(err, servers). `servers` is an array that
 * represents the servers that are available to your account
 */
function getServers(callback) {
  var self = this;

  self.login(err => {

    if (err) {
      return callback(err);
    }

    var client = new ComputeManagementClient(self.azure.credentials, self.config.subscriptionId);
    client.virtualMachines.list(self.config.resourceGroup, (err, results) => {
      return err
        ? callback(err)
        : callback(null, results.map(res => new self.models.Server(self, res)));
    });
  });
};

/**
 * Gets a server in Azure.
 * @param {Server|String} server Server id or a server
 * @param {Function} callback cb(err, serverId).
 */
function getServer(server, callback) {
  var self     = this;
  var serverId = server instanceof self.models.Server ? server.name : server;

  self.login(err => {

    if (err) {
      return callback(err);
    }

    var client = new ComputeManagementClient(self.azure.credentials, self.config.subscriptionId);
    
    // This will ensure returning of instances running status
    var options = { expand: 'instanceView' };
    client.virtualMachines.get(self.config.resourceGroup, serverId, options, (err, result) => {
      return err
        ? callback(err)
        : callback(null, new self.models.Server(self, result));
    });
  });
};

/**
 * Creates a server with the specified options
 * 
 * @description The flavor
 * properties of the options can be instances of Flavor
 * OR ids to those entities in Azure.
 * 
 * @param {object}   options - **Optional** options
 * @param {string}   options.name - **Optional** the name of server
 * @param {function} callback cb(err, server).
 */
function createServer(options, callback) {
  var self = this;

  if (!options.name || !options.username || !options.password) {
    return errs.handle(
      errs.create({ message: 'Please provide a name for the vm, as well as the username and password for login' }),
      callback
    );
  }

  if (!options.flavor) {
    return errs.handle(
      errs.create({ message: 'When creating an azure server a flavor or an image need to be supplied' }),
      callback
    );
  }

  var templateName = 'compute' + (options.imageSourceUri ? '-from-image' : '');
  self.deploy(templateName, options, (err, result) => {
    return err ?
      callback(err) :
      self.getServer(options.name, callback);
  });
};

/**
 * Destroy a server in Azure.
 * @param {Server|string} server Server id or a server
 * @param {function} callback cb(err, serverId).
 */
function destroyServer(server, callback) {
  var self = this;
  var serverId = server && server.name || server;

  self.login(err => {

    if (err) {
      return callback(err);
    }

    var client = new ComputeManagementClient(credentials, self.config.subscriptionId);
    client.virtualMachines.deleteMethod(self.config.resourceGroup, serverId, (err, result) => {
      return err
        ? callback(err)
        : callback(null, serverId);
    });
  });
};

//
// ### function stopServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Destroy a server in Azure.
//
function stopServer(server, callback) {
  var serverId = server instanceof self.models.Server ? server.id : server;

  // azureApi.stopServer(this, serverId, function (err) {
  //   return !err
  //     ? callback(null, { ok: serverId })
  //     : callback(err);
  // });
};

//
// ### function createHostedService(serviceName, callback)
// #### @serviceName {String} name of the Hosted Service
// #### @callback {Function} f(err, serverId).
//
// Creates a Hosted Service in Azure.
//
function createHostedService(serviceName, callback) {
  // azureApi.createHostedService(this, serviceName, function (err, res) {
  //   return !err
  //     ? callback(null, res)
  //     : callback(err);
  // });
};

//
// ### function rebootServer (server, options, callback)
// #### @server   {Server|String} The server to reboot
// #### @callback {Function} f(err, server).
//
// Reboots a server
//
function rebootServer(server, callback) {
  var serverId = server instanceof self.models.Server ? server.id : server;

  // azureApi.rebootServer(this, serverId, function (err) {
  //   return !err
  //     ? callback(null, { ok: serverId })
  //     : callback(err);
  // });
};

//
// ### function renameServer(server, name, callback)
// #### @server {Server|String} Server id or a server
// #### @name   {String} New name to apply to the server
// #### @callback {Function} f(err, server).
//
// Renames a server
//
function renameServer(server, name, callback) {
  return errs.handle(
    errs.create({ message: 'Not supported by Azure.' }),
    callback
  );
};

module.exports = {
  getVersion,
  getLimits,
  getServers,
  getServer,
  createServer,
  destroyServer,
  stopServer,
  createHostedService,
  rebootServer,
  renameServer
};
