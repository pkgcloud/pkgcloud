/*
 * floatingIp.js: Base network from which all pkgcloud networks inherit.
 *
 * (C) Hopebay tech
 *
 */

var util = require('util'),
    model = require('../base/model');

var FloatingIp = exports.FloatingIp = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(FloatingIp, model.Model);

FloatingIp.prototype.create = function (callback) {
  this.client.createFloatingIp(this.name, callback);
};

FloatingIp.prototype.refresh = function (callback) {
  this.client.getFloatingIp(this.id, callback);
};

FloatingIp.prototype.update = function (callback) {
  this.client.updateFloatingIp(this, callback);
};

FloatingIp.prototype.destroy = function (callback) {
  this.client.destroyFloatingIp(this.id, callback);
};
