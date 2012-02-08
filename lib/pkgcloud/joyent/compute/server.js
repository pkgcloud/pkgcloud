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
  this.progress     = details.state;
  this.imageId      = details.dataset;
  this.addresses    = details.ips;
  this.adminPass    = details.metadata.credentials.admin;
  // joyent specific
  this.created      = details.created;
  this.updated      = details.updated;
  this.type         = details.type;
  this.memory       = details.memory;
  this.disk         = details.disk;
  this.metadata     = details.metadata;
};
/*
// Set core properties

*/