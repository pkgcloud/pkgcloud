/*
 * servers.js: Instance methods for working with servers from AWS Cloud
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */
var request  = require('request'),
    base     = require('../../../core/compute'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    errs     = require('errs'),
    compute  = pkgcloud.providers.aws.compute;

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
    errs.create({message: "AWS's API is not rate limited"}), callback);
};

//
// ### function getServers (callback)
// #### @callback {function} f(err, servers). `servers` is an array that
// represents the servers that are available to your account
//
// Lists all servers available to your account.
//
exports.getServers = function getServers(callback) {
  var self = this;
  return this.query('DescribeInstances', {}, callback, function (body, res) {
    var servers = [];

    self._toArray(body.reservationSet.item).forEach(function (reservation) {
      self._toArray(reservation.instancesSet.item).forEach(function (instance) {
        servers.push(new compute.Server(self, instance));
      })
    })

    callback(null, servers, res);
  });
};

//
// ### function createServer (options, callback)
// #### @opts {Object} **Optional** options
// ####    @image    {String|Image} the image (AMI) to use
// ####    @flavor   {String|Flavor} **Optional** flavor to use for this image
// #### @callback {Function} f(err, server).
//
// Creates a server with the specified options. The flavor
// properties of the options can be instances of Flavor
// OR ids to those entities in AWS.
//
exports.createServer = function createServer(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options  = {};
  }

  options = options || {}; // no args
  var self = this,
      createOptions = {
      };

  if (!options.image) {
    return errs.handle(
      errs.create({
        message: 'options.image is a required argument.'
      }),
      callback
    );
  }

  createOptions.ImageId = options.image instanceof base.Image ?
      options.image.id
      :
      options.image;

  if (options.flavor) {
    createOptions.InstanceType = options.flavor instanceof base.Flavor ?
        options.flavor.id
        :
        options.flavor;
  }

  return this.query(
      'RunInstances',
      createOptions,
      callback,
      function (body, res) {
        callback(null, new compute.Server(self, body), res);
      }
  );
};

//
// ### function destroyServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Destroy a server in AWS.
//
exports.destroyServer = function destroyServer(server, callback) {
  var serverId = server instanceof base.Server ? server.id : server;

  return this.query(
      'TerminateInstances',
      { InstanceId: serverId },
      callback,
      function (body, res) {
        callback(null, { ok: serverId }, res);
      }
  );
};

//
// ### function getServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Gets a server in AWS.
//
exports.getServer = function getServer(server, callback) {
  var self     = this,
      serverId = server instanceof base.Server ? server.id : server;

  return this.query(
      'DescribeInstances',
      { 'InstanceId.1' : serverId },
      callback,
      function (body, res) {
        var servers = [];

        toArray(body.reservationSet.item).forEach(function (reservation) {
          toArray(reservation.instancesSet.item).forEach(function (instance) {
            servers.push(new compute.Server(self, instance));
          })
        })

        if (servers.length == 0) {
          callback(new Error('Server not found'));
        } else {
          callback(null, servers[0], res);
        }
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
  var serverId = server instanceof base.Server ? server.id : server;
  var createOptions = {
    method: 'POST',
    path: this.account + '/machines/' + serverId + '?action=reboot'
  };

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
    errs.create({ message: 'Not supported by AWS.'}), callback);
};
