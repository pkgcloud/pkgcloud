/*
 * server.js: Azure Server
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var utile = require('utile'),
    base  = require('../../core/compute/server');

var Server = exports.Server = function Server(client, details) {
  base.Server.call(this, client, details);
};

utile.inherits(Server, base.Server);

Server.prototype._setProperties = function (details) {
  this.id   = details.Name;
  this.name = details.Name;

  if (details.Status) {
    switch (details.Status.toUpperCase()) {
      case 'PENDING':
        this.status = 'PROVISIONING';
        break;
      case 'RUNNING':
        this.status = 'RUNNING';
        break;
      case 'STOPPING':
      case 'STOPPED':
        this.status = 'STOPPED';
        break;
      case 'TERMINATED':
        this.status = 'TERMINATED';
        break;
      default:
        this.status = 'UNKNOWN';
        break;
    }
  }

  var addresses = { private: [], public: [] };

  // TODO: Need to clean up once I understand what is private ip?
  if(details.RoleInstanceList && details.RoleInstanceList.RoleInstance) {
    var ip =  details.RoleInstanceList.RoleInstance.IpAddress;
    addresses.public.push(ip);
    addresses.private.push(ip);
  }
  this.addresses  = details.addresses = addresses;

  if(details.RoleList && details.RoleList.Role) {
    if(details.RoleList.Role.OSVirtualHardDisk) {
      this.imageId = details.RoleList.Role.OSVirtualHardDisk.SourceImageName;
    }
  }

  // if requestId is defined we need to poll server using requestId for status
  this.requestId = details.requestId;
  this.serviceName = details.serviceName;

  this.original   = this.azure = details;
};
