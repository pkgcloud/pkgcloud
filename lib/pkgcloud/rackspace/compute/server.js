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
  this.id = details.id;
  this.name = details.name;

  // Set extra properties
  this.progress = details.progress || this.progress;
  this.imageId = details.imageId || this.imageId;
  this.adminPass = details.adminPass || this.adminPass;
  this.flavorId = details.flavorId || this.flavorId;
  this.status = details.status || this.status;
  this.hostId = details.hostId || this.hostId;
  this.addresses = details.addresses || {};
  this.metadata = details.metadata || {};
};
