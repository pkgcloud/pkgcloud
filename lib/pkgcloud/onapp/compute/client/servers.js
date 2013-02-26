/*
 * servers.js: Instance methods for working with servers from Onapp Clouds
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */
var request  = require('request'),
    base     = require('../../../core/compute'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    errs     = require('errs'),
    compute  = pkgcloud.providers.onapp.compute;


// ### function getVersion (callback)
//
// Gets the current API version
//
// #### @callback {function} f(err, version).
//
exports.getVersion = function getVersion(callback) {
  return this.request('version.json',callback , function (body, res) {
    try {
      callback(null, body.version, res);
    } catch (ex) {
      return errs.handle(ex, callback);
    }
  });
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
  return this.request('virtual_machines.json', callback, function (body, res) {
    callback(null, body.map(function (result) {
      return new compute.Server(self, result.virtual_machine);
    }), res);
  });
};

// ### function createServer (options, callback)
//
// Creates a server with the specified options.
//
exports.createServer = function createServer(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options  = {};
  }

  options = options || {};

  var self          = this,
      createOptions = {
        method: 'POST',
        path:   'virtual_machines.json',
        body:   { virtual_machine: options }
      };

  ['hostname','template_id'].forEach(function (member){
      if (!options[member]) {
        errs.handle(
          errs.create({ message: 'options.' + required + ' is a required argument.' }),
          callback
        );
      }
  });

  options.required_ip_address_assignment = options.required_ip_address_assignment || '1';
  options.required_virtual_machine_build = options.required_virtual_machine_build || '1';
  options.cpu_shares = options.cpu_shares || '50';
  options.primary_disk_size = options.primary_disk_size || '5';
  options.swap_disk_size = options.swap_disk_size || '1';
  options.cpus = options.cpus || '1';
  options.memory = options.memory || '256';
  options.label = options.label || options.hostname;

  return this.request(createOptions, callback, function (body, res) {
    callback(null, new compute.Server(self, body.virtual_machine), res);
  });
};

//
// ### function destroyServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Destroy a server.
//
exports.destroyServer = function destroyServer(server, callback) {
  var serverId = server instanceof base.Server ? server.id : server;

  var destroyOptions = {
    method: 'DELETE',
    path: 'virtual_machines/' + serverId + '.json'
  };

  return this.request(destroyOptions, callback, function (body, res) {
    callback(null, body, res);
  });
};

//
// ### function getServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Gets a server from an Onapp cloud.
//
exports.getServer = function getServer(server, callback) {
  var self       = this,
      serverId   = server instanceof base.Server ? server.id : server;

  return this.request('virtual_machines/' + serverId + '.json', callback, function (body, res) {
    callback(null, new compute.Server(self, body.virtual_machine), res);
  });
};

//
// ### function rebootServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Reboots a server
//
exports.rebootServer = function rebootServer(server, callback) {
  var serverId = server instanceof base.Server ? server.id : server;

  var rebootOptions = {
    method: 'POST',
    path: 'virtual_machines/' + serverId + '/reboot.json'
  };

  return this.request(rebootOptions, callback, function (body, res) {
    callback(null, body, res);
  });
};
