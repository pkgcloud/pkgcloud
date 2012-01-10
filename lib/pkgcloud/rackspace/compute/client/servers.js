/*
 * servers.js: Instance methods for working with servers from Rackspace Cloud
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var request = require('request'),
    base = require('../../../core/compute'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    compute = pkgcloud.providers.rackspace.compute;

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
  
  this.request(actionOptions, callback, function (body, res) {
    callback(null, res);
  });
};

//
// Gets the version of the Rackspace CloudServers API we are running against
// Parameters: callback
//
exports.getVersion = function (callback) {
  var versionOptions = {
    uri: 'https://' + this.serversUrl,
  };

  request(versionOptions, function (err, res, body) {
    callback(null, JSON.parse(body).versions);
  });
};

//
// Gets the current API limits when authenticated.
// Parameters: callback
//
exports.getLimits = function (callback) {
  this.request('limits', callback, function (body) {
    callback(null, JSON.parse(body).limits);
  });
};

//
// Gets all servers for the authenticated username / apikey.
//
exports.getServers = function (details, callback) {
  var self = this;

  if (typeof details === 'function') {
    callback = details;
    details = false;
  }

  if (details) {
    return this.getServerDetails(callback);
  }

  this.request('servers.json', callback, function (body) {
    callback(null, JSON.parse(body).servers.map(function (result) {
      return new compute.Server(self, result);
    }));
  });
};

//
// Gets all servers for the authenticated username / apikey with
// all details included.
//
exports.getServerDetails = function (callback) {
  var self = this;
  this.request('servers/detail.json', callback, function (body) {
    callback(null, JSON.parse(body).servers.map(function (result) {
      return new compute.Server(self, result);
    }));
  });
};

//
// Gets the details for the server with the specified id.
// Parameters: id callback
//
exports.getServer = function (server, callback) {
  var serverId = server instanceof base.Server ? server.id : server;
      self = this;
      
  this.request('servers/' + serverId, callback, function (body) {
    callback(null, new compute.Server(self, JSON.parse(body).server));
  });
};

exports.getServerAddresses = function (server, type, callback) {
  if (!callback && typeof type === 'function') {
    callback = type;
    type = '';
  }
  
  var serverId = server instanceof base.Server ? server.id : server;
      self = this;

  this.request(['servers', serverId, 'ips', type].join('/'), callback, function (body) {
    var result = JSON.parse(body);
    callback(null, result.addresses || result);
  });
}

//
// Creates a server with the specified options. The flavor / image
// properties of the options can be instances of node-cloudserver's
// objects (Flavor, Image) OR ids to those entities in Rackspace.
// Parameters: options callback
//
exports.createServer = function (options, callback) {
  var self = this,
      flavorId,
      imageId;

  ['flavor', 'image', 'name'].forEach(function (required) {
    if (!options[required]) throw new Error('options.' + required + ' is a required argument.');
  });

  flavorId = options['flavor'] instanceof base.Flavor ? options['flavor'].id : parseInt(options['flavor'], 10);
  imageId  = options['image']  instanceof base.Image  ? options['image'].id  : parseInt(options['image'], 10);

  // Remark: We should do something fancy for personality
  // like reading all the files in via fs.readFile, etc.
  var createOptions = {
    method: 'POST',
    path: 'servers',
    body: {
      server: {
        name: options['name'],
        imageId: imageId,
        flavorId: flavorId,
        metadata: options['metadata'],
        personality: options['personality'] || []
      }
    }
  };

  this.request(createOptions, callback, function (body, response) {
    var server = new compute.Server(self, JSON.parse(body).server);
    callback(null, server);
  });
};

exports.destroyServer = function (server, callback) {
  var serverId = server instanceof base.Server ? server.id : server;
  this.request('DELETE', 'servers/' + serverId, callback, function (body, response) {
    callback(null, response);
  });
};

exports.renameServer = function (server, name, callback) {
  var serverId = server instanceof base.Server ? server.id : server;

  this.request({
    method:'PUT',
    path: ['servers', serverId],
    body: { server: { name: name } }
  }, callback, function (body, response) {
    callback(null, response);
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

//
// Reboots this instance with either a 'soft' or 'hard' reboot
// Parameters: type['soft' || 'hard']? callback
//
// Remark: This doesn't work!
exports.rebootServer = function (server, type, callback) {
  if (!callback && typeof type === 'function') {
    callback = type;
    type = 'soft'; 
  }
  
  var serverId = server instanceof base.Server ? server.id : server;
  serverAction.call(this, serverId, { 'reboot': { 'type': type.toUpperCase() } }, callback);
},

exports.getServerBackup = function (server, callback) {
  var serverId = server instanceof base.Server ? server.id : server;
  var backupOptions = {
    method: 'GET', 
    path: ['servers', serverId, 'backup_schedule']
  };
  
  this.request(backupOptions, callback, function (body) {
    callback(null, JSON.parse(body).backupSchedule);
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