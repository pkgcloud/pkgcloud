/*
 * servers.js: Instance methods for working with servers from Rackspace Cloud
 *
 * (C) 2011-2012 Nodejitsu Inc.
 *
 */
var request  = require('request'),
    base     = require('../../../core/compute'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    errs     = require('errs'),
    compute  = pkgcloud.providers.rackspace.compute;

//
// Helper method for performing 'Server Actions' to /servers/:id/action
// e.g. Reboot, Rebuild, Resize, Confirm Resize, Revert Resize
//
function serverAction(id, body, callback) {
  var actionOptions = {
    method: 'POST',
    path: ['servers', id, 'action'],
    body: body
  };
  
  return this.request(actionOptions, callback, function (body, res) {
    callback(null, { ok: id }, res);
  });
}

// ### function getVersion (callback) 
//
// Gets the current API version
//
// #### @callback {function} f(err, version).
//
exports.getVersion = function getVersions(callback) {
  return request.get('https://' + this.serversUrl, function (err, res, body) {
    try {
      var version = ((typeof body === 'object') ? body.versions[0].id : JSON.parse(body).versions[0].id);
      callback(null, version, res);
    } catch (ex) {
      return errs.handle(ex, callback);
    }
  });
};

// ### function getLimits (callback) 
//
// Gets the current API limits
//
// #### @callback {function} f(err, version).
//
exports.getLimits = function (callback) {
  return this.request('limits', callback, function (body, res) {
    callback(null, body.limits, res);
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
  return this.request('servers/detail.json', callback, function (body, res) {
    callback(null, body.servers.map(function (result) {
      return new compute.Server(self, result);
    }), res);
  });
};

// ### function createServer (options, callback) 
//
// Creates a server with the specified options. The flavor
// properties of the options can be instances of Flavor
// OR ids to those entities in Rackspace.
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
  
  var self          = this,
      createOptions = { 
        method: 'POST',
        path:   'servers',
        body:   { server: options }
      };
      
  ['flavor', 'image', 'name'].forEach(function (member) {
    if (options.required) { // marked as required?
      if (!options[member]) {
        errs.handle(
          errs.create({ message: 'options.' + required + ' is a required argument.' }),
          callback
        );
      }
    }
  });
  
  if (options.flavor) {
    createOptions.body.server.flavorId = options.flavor instanceof base.Flavor 
      ? options.flavor.id
      : parseInt(options.flavor, 10);
  }
  
  if (options.image) {
    createOptions.body.server.imageId  = options.image  instanceof base.Image
      ? options.image.id
      : parseInt(options.image, 10);
  }
  
  createOptions.body.server.personality = options.personality || [];
  
  return this.request(createOptions, callback, function (body, res) {
    callback(null, new compute.Server(self, body.server), res);
  });
};

//
// ### function destroyServer(server, callback) 
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Destroy a server in Rackspace.
//
exports.destroyServer = function destroyServer(server, callback) {
  var serverId = server instanceof base.Server ? server.id : server;
  var destroyOptions = {
    method: 'DELETE',
    path: 'servers/' + serverId
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
// Gets a server in Rackspace.
//
exports.getServer = function getServer(server, callback) {
  var self       = this,
      serverId   = server instanceof base.Server ? server.id : server;

  return this.request('servers/' + serverId, callback, function (body, res) {
    callback(null, new compute.Server(self, body.server), res);
  });
};

//
// ### function rebootServer (server, options, callback) 
// #### @server      {Server|String} The server to reboot
// #### @options     {Object} **Optional** options
// ####    @type     {String} **Optional** Soft or Hard. Rackspace only.
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

// legacy code below
// DEPRECATED
// not officially supported
exports.getServerAddresses = function (server, type, callback) {
  if (!callback && typeof type === 'function') {
    callback = type;
    type = '';
  }
  
  var serverId = server instanceof base.Server ? server.id : server;
      self = this;

  this.request(['servers', serverId, 'ips', type].join('/'), callback, function (body, res) {
    var result = body;
    callback(null, result.addresses || result, res);
  });
};

exports.renameServer = function (server, name, callback) {
  var serverId = server instanceof base.Server ? server.id : server;

  this.request({
    method: 'PUT',
    path: ['servers', serverId],
    body: { server: { name: name } }
  }, callback, function (body, res) {
    callback(null, body, res);
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
    path: ['servers', serverId, 'backup_schedule']
  };
  
  this.request(backupOptions, callback, function (body, res) {
    callback(null, body.backupSchedule, res);
  });  
};

exports.updateServerBackup = function (server, backup, callback) {
  var serverId = server instanceof base.Server ? server.id : server;
  var updateOptions = {
    method: 'POST',
    path: ['servers', serverId, 'backup_schedule'],
    body: {
      backupSchedule: backup
    }
  };
  
  this.request(updateOptions, callback, function (body, res) {
    callback(null, res);
  });
};

exports.disableServerBackup = function (server, callback) {
  var serverId = server instanceof base.Server ? server.id : server,
      disableUrl = ['servers', serverId, 'backup_schedule'].join('/');
      
  this.request('DELETE', disableUrl, callback, function (body, res) {
    callback(null, res);
  });
};