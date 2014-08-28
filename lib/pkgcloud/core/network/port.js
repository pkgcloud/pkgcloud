/*
 * port.js: Base network from which all pkgcloud ports inherit.
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var util = require('util'),
    model = require('../base/model');

var Port = exports.Port = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(Port, model.Model);

Port.prototype.create = function (callback) {
  this.client.createPort(this.name, callback);
};

Port.prototype.refresh = function (callback) {
  this.client.getPort(this.id, callback);
};

Port.prototype.update = function (callback) {
  this.client.updatePort(this, callback);
};

Port.prototype.destroy = function (callback) {
  this.client.destroyPort(this.id, callback);
};
