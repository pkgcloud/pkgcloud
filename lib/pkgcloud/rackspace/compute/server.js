/*
 * server.js: Rackspace Cloud server
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    base = require('../../core/compute/server');

var Server = exports.Server = function Server(client, details) {
  base.Server.call(this, client, details);
};

utile.inherits(Server, base.Server);

Server.prototype._setProperties = function (details) {
  // Set core properties
  this.id   = details.id;
  this.name = details.name;

  if (details.status) {
    switch (details.status.toUpperCase()) {
      case 'BUILD':
      case 'REBUILD':
        this.status = "PROVISIONING";
        break;
      case 'ACTIVE':
        this.status = "RUNNING";
        break;
      case 'SUSPENDED':
        this.status = "STOPPED";
        break;
      case 'REBOOT':
      case 'HARD_REBOOT':
        this.status = "REBOOT";
        break;
      case 'QUEUE_RESIZE':
      case 'PREP_RESIZE':
      case 'RESIZE':
      case 'VERIFY_RESIZE':
      case 'SHARE_IP':
      case 'SHARE_IP_NO_CONFIG':
      case 'DELETE_IP':
      case 'PASSWORD':
        this.status = "UPDATING";
        break;
      case 'RESCUE':
        this.status = 'ERROR';
        break;
      default: 
        this.status = "UNKNOWN";
        break;
    }
  }

  //
  // Set extra properties
  //
  this.progress  = details.progress  || this.progress;
  this.imageId   = details.imageId   || this.imageId;
  this.adminPass = details.adminPass || this.adminPass;
  this.addresses = details.addresses || {};
  this.metadata  = details.metadata  || {};
  this.flavorId  = details.flavorId  || this.flavorId;
  this.hostId    = details.hostId    || this.hostId;
  this.original  = this.rackspace    = details;
};

// legacy code below
// DEPRECATED
// not officially supported

//
// Confirms that the newly resized server for this instance
// is working correctly. Removes the previous server at 
// Rackspace and it cannot be rolled back to. 
// Parameters: callback
//
// Remark: This doesn't work!
Server.prototype.confirmResize = function (callback) {
  this.client.confirmServerResize(this.id, callback);
};

//
// Updates the backup schedule for this instance.
// Parameters: backup callback
//
Server.prototype.updateBackup = function (backup, callback) { 
  var self = this;
  this.client.updateServerBackup(this.id, backup, function (err, res) {
    if (err) {
      return callback(err);
    }
    
    self.backups = backup;
    callback(null, res);
  });
};

//
// Disables the backup schedule for this instance.
// Parameters: callback
//
Server.prototype.disableBackup = function (callback) {
  this.client.disableServerBackup(this.id, callback);
};

//
// Updates the addresses for this instance
// Parameters: type['public' || 'private]? callback
//
Server.prototype.getAddresses = function (type, callback) {
  if (!callback && typeof type === 'function') {
    callback = type;
    type = '';
  }
  
  var self = this;
  this.client.getServerAddresses(this, type, function (err, addresses) {
    if (err) {
      return callback(err);
    }

    if (type === '') {
      self.addresses = addresses;
    }
    else {
      self.addresses = addresses || {};
      self.addresses[type] = addresses[type];
    }
    
    callback(null, addresses);
  });
};

//
// Gets the backup schedule for this instance
// Parameters: callback
//
Server.prototype.getBackup = function (callback) {
  var self = this;
  this.client.getServerBackup(this.id, function (err, backups) {
    if (err) {
      return callback(err);
    }
    
    self.backups = backups;
    callback(null, backups);
  });  
};

//
// Rebuilds this instance with the specified image. This 
// will delete all data on the server instance. The 'image' can
// be an instance of a node-cloudservers Image or an image id.
// Parameters: image callback
//
// Remark: This doesn't work!
Server.prototype.rebuild = function (image, callback) {
  this.client.rebuildServer(image, callback);
};

//
// Rolls back this instance to a previously saved server during a resize.
// Parameters: callback
//
// Remark: This doesn't work!
Server.prototype.revertResize = function (callback) {
  this.client.revertServerResize(this.id, callback);
};
