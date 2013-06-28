/*
 * server.js: Onapp Cloud server
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
  this.id   = details.identifier;
  this.name = details.label;

  if(details.booted === true) {
    this.status = "RUNNING";
  } else {
    this.status = "STOPPED";
  }

  this.disk = details.total_disk_size;
  this.addresses = details.ip_addresses;
  this.locked = details.locked;
  this.ram = details.memory;
  this.priority = details.cpu_shares;
  this.cpus = details.cpus;
  this.hostname = details.hostname;
};

Server.prototype.destroy = function (callback) {
  return this.client.destroyServer(this, callback);
};

Server.prototype.reboot = function (callback) {
  return this.client.rebootServer(this, callback);
};