/*
 * lbaasHealthMonitor.js: Health monitor for load balancer.
 *
 * (C) Hopebay tech
 *
 */

var util = require('util'),
    model = require('../base/model');

var HealthMonitor = exports.HealthMonitor = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(HealthMonitor, model.Model);

HealthMonitor.prototype.create = function (callback) {
  this.client.createFloatingIp(this.name, callback);
};

HealthMonitor.prototype.refresh = function (callback) {
  this.client.getFloatingIp(this.id, callback);
};

HealthMonitor.prototype.update = function (callback) {
  this.client.updateFloatingIp(this, callback);
};

HealthMonitor.prototype.destroy = function (callback) {
  this.client.destroyFloatingIp(this.id, callback);
};