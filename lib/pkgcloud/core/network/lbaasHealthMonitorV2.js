/*
 * lbaaspools.js: pool operations for lbaas
 *
 * (C) 2015 Hopebay tech
 *
 */

var util = require('util'),
    model = require('../base/model');

var lbaasHealthMonitorV2 = exports.lbaasHealthMonitorV2 = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(lbaasHealthMonitorV2, model.Model);

lbaasHealthMonitorV2.prototype.create = function (callback) {
  this.client.createHealthMonitorV2(this.name, callback);
};

lbaasHealthMonitorV2.prototype.refresh = function (callback) {
  this.client.getHealthMonitorsV2(this.id, callback);
};

lbaasHealthMonitorV2.prototype.update = function (callback) {
  this.client.updateHealthMonitorV2(this, callback);
};

lbaasHealthMonitorV2.prototype.destroy = function (callback) {
  this.client.destroyHealthMonitorV2(this.id, callback);
};
