/*
 * servers.js: Instance methods for working with servers from OpenStack Cloud
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */
var request  = require('request'),
    base     = require('../../../core/compute'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    errs     = require('errs'),
    compute  = pkgcloud.providers.openstack.compute;

//
// Helper method for performing 'Server Actions' to /servers/:id/action
// e.g. Reboot, Rebuild, Resize, Confirm Resize, Revert Resize
//
function serverAction(id, body, callback) {
  var actionOptions = {
    method: 'POST',
    path: ['servers', id, 'action'].join('/'),
    body: body
  };

  return this.request(actionOptions, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, { ok: id }, res);
  });
}

// ### function getLimits (callback)
//
// Gets the current API limits
//
// #### @callback {function} f(err, version).
//
exports.getLimits = function (callback) {
  return this.request({
    path: 'limits'
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.limits, res);
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
  return this.request({
    path: 'servers/detail'
  }, function (err, body, res) {
    if (err) {
      return callback(err);
    }
    if (!body || !body.servers) {
      return callback(new Error('Unexpected empty response'));
    }
    else {
      return callback(null, body.servers.map(function (result) {
        return new compute.Server(self, result);
      }), res);
    }
  });
};

// ### function createServer (options, callback)
//
// Creates a server with the specified options. The flavor
// properties of the options can be instances of Flavor
// OR ids to those entities in OpenStack.
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

  options = options || {};

  ['flavor', 'image', 'name'].forEach(function (member) {
    if (options.required) { // marked as required?
      if (!options[member]) {
        errs.handle(
          errs.create({ message: 'options.' + member + ' is a required argument.' }),
          callback
        );
      }
    }
  });

  var self          = this,
      createOptions = {
        method: 'POST',
        path:   'servers',
        body: {
          server: {
            name: options.name
          }
        }
      };

  if (options.flavor) {
    createOptions.body.server.flavorRef = options.flavor instanceof base.Flavor
      ? options.flavor.id
      : options.flavor;
  }

  if (options.image) {
    createOptions.body.server.imageRef  = options.image  instanceof base.Image
      ? options.image.id
      : options.image;
  }

  if (options.networks) {
    createOptions.body.networks = options.networks;
  }

  createOptions.body.server.personality = options.personality || [];
  createOptions.body.server.key_name = options.keyname || null;

  return this.request(createOptions, function (err, body, res) {
    if (err) {
      return callback(err);
    }

    if (!body || !body.server) {
      return new Error('Server not passed back from OpenStack.');
    }

    callback(null, new compute.Server(self, {
      id: body.server.id,
      name: options.name,
      adminPass: body.server.adminPass,
      flavorId: body.server.flavorRef,
      imageId: body.server.imageRef,
      personality: body.server.personality
    }), res);
  });
};

//
// ### function destroyServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Destroy a server in OpenStack.
//
exports.destroyServer = function destroyServer(server, callback) {
  var serverId = server instanceof base.Server ? server.id : server;
  var destroyOptions = {
    method: 'DELETE',
    path: 'servers/' + serverId
  };

  return this.request(destroyOptions, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, {ok: serverId}, res);
  });
};

//
// ### function getServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Gets a server in OpenStack.
//
exports.getServer = function getServer(server, callback) {
  var self       = this,
      serverId   = server instanceof base.Server ? server.id : server;

  return this.request({
    path: 'servers/' + serverId
  }, function (err, body, res) {
    if (err) {
      return callback(err);
    }
    if (!body.server) {
      return new Error('Unexpected empty response');
    }
    else {
      callback(null, new compute.Server(self, body.server), res);
    }
  });
};

//
// ### function rebootServer (server, options, callback)
// #### @server      {Server|String} The server to reboot
// #### @options     {Object} **Optional** options
// ####    @type     {String} **Optional** Soft or Hard. OpenStack only.
// ####    @*        {*}      **Optional** Anything platform specific
// #### @callback {Function} f(err, server).
//
// Reboots a server
//
exports.rebootServer = function rebootServer(server, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options  = {};
  }

  options.type = options.type ? options.type.toUpperCase() : 'SOFT';
  var serverId = server instanceof base.Server ? server.id : server;
  return serverAction.call(this, serverId, { 'reboot': options }, callback);
};

//
// # Provider specific implementation follows
// **not officially supported**
//

exports.addFloatingIp = function (server, ip, callback) {
  var serverId = server instanceof base.Server ? server.id : server;

  serverAction.call(this, serverId, {
    addFloatingIp: {
      address: ip
    }
  }, callback);
};

exports.getServerAddresses = function (server, type, callback) {
  if (!callback && typeof type === 'function') {
    callback = type;
    type = '';
  }

  var serverId = server instanceof base.Server ? server.id : server,
      self = this;

  this.request({
    path: ['servers', serverId, 'ips', type].join('/')
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.addresses || body, res);
  });
};

exports.renameServer = function (server, name, callback) {
  var serverId = server instanceof base.Server ? server.id : server;

  this.request({
    method: 'PUT',
    path: ['servers', serverId].join('/'),
    body: { server: { name: name } }
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body, res);
  });
};

exports.confirmServerResize = function (server, callback) {
  var serverId = server instanceof base.Server ? server.id : server;
  serverAction.call(this, serverId, { 'confirmResize': null }, callback);
};

exports.revertServerResize = function (server, callback) {
  var serverId = server instanceof base.Server ? server.id : server;
  serverAction.call(this, serverId, { 'revertResize': null }, callback);
};

exports.rebuildServer = function (server, image, callback) {
  var imageId = image instanceof base.Image ? image.id : image,
      serverId = server instanceof base.Server ? server.id : server;

  serverAction.call(this, serverId, { 'rebuild': { 'imageId': imageId } }, callback);
};

exports.getServerBackup = function (server, callback) {
  var serverId = server instanceof base.Server ? server.id : server;
  var backupOptions = {
    method: 'GET',
    path: ['servers', serverId, 'backup_schedule'].join('/')
  };

  this.request(backupOptions, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.backupSchedule, res);
  });
};

exports.updateServerBackup = function (server, backup, callback) {
  var serverId = server instanceof base.Server ? server.id : server;
  var updateOptions = {
    method: 'POST',
    path: ['servers', serverId, 'backup_schedule'].join('/'),
    body: {
      backupSchedule: backup
    }
  };

  this.request(updateOptions, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, res);
  });
};

exports.disableServerBackup = function (server, callback) {
  var serverId = server instanceof base.Server ? server.id : server,
      disableUrl = ['servers', serverId, 'backup_schedule'].join('/');

  this.request({
    method: 'DELETE',
    path: disableUrl
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, res);
  });
};
