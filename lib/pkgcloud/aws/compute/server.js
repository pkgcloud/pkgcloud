/*
 * server.js: AWS Server
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    base  = require('../../core/compute/server');

var Server = exports.Server = function Server(client, details) {
  base.Server.call(this, client, details);
};

utile.inherits(Server, base.Server);

Server.prototype._setProperties = function (details) {
  this.id   = details.instanceId;
  this.name = details.name || (details.meta || {}).name;

  if (details.instanceState) {
    switch (details.instanceState.name.toUpperCase()) {
      case 'PENDING':
        this.status = "PROVISIONING";
        break;
      case 'RUNNING':
        this.status = "RUNNING";
        break;
      case 'STOPPING':
      case 'STOPPED':
        this.status = "STOPPED";
        break;
      default:
        this.status = "UNKNOWN";
        break;
    }
  }

  var addresses = { "private": [], "public": [] };

  if (details.ipAddress) {
    addresses.public.push(details.ipAddress);
  }
  if (details.privateIpAddress) {
    addresses.private.push(details.privateIpAddress);
  }

  //
  // AWS specific
  //

  this.imageId   = details.imageId;
  this.addresses = addresses;
  this.launchTime = details.launchTime;
  this.type      = details.instanceType;
  this.original  = this.aws = details;

};
