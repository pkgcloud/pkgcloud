/*
 * servers.js: Instance methods for working with servers from Onapp Clouds
 *
 * 2013 Pedro Dias
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
exports.getVersion = function getVersions(callback) {
  return request.get('https://' + this.serversUrl + '/version.json', function (err, res, body) {
    try {
      var version = JSON.parse(body).version;
      callback(null, version, res);
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

  ['memory','cpus','hostname','label','primary_disk_size','swap_disk_size','template_id'].forEach(function (member){
    if (options.required) { // marked as required?
      if (!options[member]) {
        errs.handle(
          errs.create({ message: 'options.' + required + ' is a required argument.' }),
          callback
        );
      }
    }
  });

  options.required_ip_address_assignment = options.required_ip_address_assignment || '1';
  options.required_virtual_machine_build = options.required_virtual_machine_build || '1';

  return this.request(createOptions, callback, function (body, res) {
    callback(null, new compute.Server(self, body.server), res);
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
    uri: 'virtual_machines/' + serverId + '.json',
    client: this
  };

  return this.request(destroyOptions, callback, function (body, res) {
    callback(null, {ok: serverId}, res);
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
// Reboots a server
//
exports.rebootServer = function rebootServer(server, options, callback) {
  return {};
};
