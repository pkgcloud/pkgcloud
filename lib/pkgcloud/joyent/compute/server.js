/*
 * server.js: Joyent Cloud Machine
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
  this.id           = details.id;
  this.name         = details.name;

  if(details.state) {
    switch (details.state.toUpperCase())
    {
      case 'PROVISIONING':
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

  // specific
  this.imageId      = details.dataset;
  this.addresses    = details.ips;
  this.adminPass    = details.metadata && details.metadata.credentials &&
                      details.metadata.credentials.admin;
  this.created      = details.created;
  this.updated      = details.updated;
  this.type         = details.type;
  this.ram          = details.memory;
  this.disk         = details.disk;
  this.metadata     = details.metadata;
  this.original     = this.joyent = details;
};