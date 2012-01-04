/*
 * server.js: Base server from which all pkgcloud servers inherit from 
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    model = require('../base/model');

var Server = exports.Server = function (client, details) {
  model.Model.call(this, client, details);
};

utile.inherits(Server, model.Model);

Server.prototype.refresh = function (callback) {
  this.client.getServer(this, callback);
};

Server.prototype.create = function (callback) {
  this.client.createServer(this, callback);
};

Server.prototype.update = function (callback) {
  this.client.updateServer(this, callback);
};

Server.prototype.destroy = function (callback) {
  this.client.destroyServer(this, callback);
};

Server.prototype.reboot = function (callback) {
  this.client.reboot(this, callback);
};

Server.prototype.resize = function (callback) {
  this.client.resize(this, callback);
};
