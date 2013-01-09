/*
 * server.js: OpenStack Cloud server
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    base = require('../../core/compute/server');

var Server = exports.Server = function Server(client, details) {
  base.Server.call(this, client, details);
};

utile.inherits(Server, base.Server);

Server.prototype._setProperties = function (details) {
  var self = this;
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
  this.original  = this.openstack = details;

  if (Object.keys(this.addresses).length && !this.addresses.public
    && !this.addresses.private) {
    this.addresses = Object.keys(this.addresses)
      .map(function (network) {
        return self.addresses[network]
      })
      .reduce(function (all, interfaces) {
        Object.keys(interfaces).map(function (interface) {
          return interfaces[interface].addr
        })
        .forEach(function (ip) {
          if (/(^127\.0\.0\.1)|(^10\.)|(^172\.1[6-9]\.)|(^172\.2[0-9]\.)|(^172\.3[0-1]\.)|(^100\.)/.test(ip)) {
            all['private'].push(ip);
          }
          else {
            all['public'].push(ip);
          }
        });

        return all;
      }, { public: [], private: [] });
  }

  // Try to set the flavorId using a flavor object
  if (typeof this.flavorId === "undefined" &&
      details.flavor && details.flavor.id) {
    this.flavorId = details.flavor.id;
  }

  // Try to set the imageId using an image object
  if (typeof this.imageId === "undefined" &&
      details.image && details.image.id) {
    this.imageId = details.image.id;
  }
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