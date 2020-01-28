/**
 * Created by Ali Bazlamit on 8/10/2017.
 */

var base = require('../../../core/compute'),
  pkgcloud = require('../../../../../lib/pkgcloud'),
  errs = require('errs'),
  oneandone = require('liboneandone-2'),
  compute = pkgcloud.providers.oneandone.compute;

//
// ### function getVersion (callback)
// #### @callback {function} f(err, version).
//
// Gets the current API version
//
exports.getVersion = function getVersion(callback) {
  callback(null, '1.7');
};

//
// ### function getServers (callback)
// #### @callback {function} f(err, servers). `servers` is an array that
// represents the servers that are available to your account
//
// Lists all servers available to your account.
//
exports.getServers = function getServers(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var self = this;

  oneandone.listServers(function (error, response, results) {
    if (error) {
      callback(error);
      return;
    }
    callback(null, JSON.parse(results).map(function (server) {
      return new compute.Server(self, server);
    }));
  });
};

//
// ### function createServer (options, callback)
// #### @opts {Object} **Optional** options
// ####    @name     {String} **Optional** the name of server
// ####    @image    {String|Image} the image ID to use
// ####    @flavor   {String|Flavor} **Optional** flavor to use for this image
// #### @callback {Function} f(err, server).
//
// Creates a server with the specified options. The flavor
// id of the options can be ids of Hardware Flavors
//
exports.createServer = function createServer(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var self = this,
    ImageId,
    FlavorId,
    hardware = {};
  options = options || {}; // no args
  if (!options.image) {
    return errs.handle(
      errs.create({
        message: 'options.image is a required argument.'
      }),
      callback
    );
  }
  ImageId = options.image instanceof base.Image
    ? options.image.id
    : options.image;

  if (options.flavor) {
    FlavorId = options.flavor instanceof base.Flavor
      ? options.flavor.id
      : options.flavor;
    hardware = {
      'fixed_instance_size_id': FlavorId
    };
  } else {
    return errs.handle(
      errs.create({
        message: 'options.flavor: is required'
      }),
      callback
    );
  }

  var serverData = {
    'name': options.name,
    'hardware': hardware,
    'appliance_id': ImageId,
    'datacenter_id': options.location
  };

  oneandone.createServer(serverData, function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 202) {
      callback(JSON.parse(body));
      return;
    }
    var _server = JSON.parse(body);
    var server = new compute.Server(self, _server);
    callback(null, server);
  });
};

//
// ### function destroyServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Destroy a server in OAO.
//
exports.destroyServer = function destroyServer(server, callback) {
  var serverId = server instanceof base.Server ? server.id : server;
  oneandone.deleteServer(serverId, false, function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 202) {
      callback(JSON.parse(body));
      return;
    }
    callback(null, JSON.parse(body));
  });
};

//
// ### function getServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Gets a server in OAO.
//
exports.getServer = function getServer(server, callback) {
  var self = this,
    serverId = server instanceof base.Server ? server.id : server;

  oneandone.getServer(serverId, function (error, response, body) {
      if (error) {
        return callback(error);
      }
      var srv = JSON.parse(body);
      callback(null, new compute.Server(self, srv));
    }
  );
};

//
// ### function rebootServer (server, options, callback)
// #### @server   {Server|String} The server to reboot
// #### @callback {Function} f(err, server).
//
// Reboots a server
//
exports.rebootServer = function rebootServer(server, callback) {
  var self = this,
    serverId = server instanceof base.Server ? server.id : server;

  var updateData = {
    'action': oneandone.ServerUpdateAction.REBOOT,
    'method': oneandone.ServerUpdateMethod.SOFTWARE

  };

  oneandone.updateServerStatus(serverId, updateData, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    if (response.statusCode != 202) {
      callback(JSON.parse(body));
      return;
    }
    var _server = JSON.parse(body);
    var server = new compute.Server(self, _server);
    callback(null, server);
  });
};