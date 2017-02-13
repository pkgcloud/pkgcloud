/*
 * lbaaspools.js: pool operations for lbaas
 *
 * (C) 2015 Hopebay tech
 *
 */

var util = require('util'),
    model = require('../base/model');

var lbaasPoolsV2 = exports.lbaasPoolsV2 = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(lbaasPoolsV2, model.Model);

lbaasPoolsV2.prototype.create = function (callback) {
  this.client.createPoolv2(this.name, callback);
};

lbaasPoolsV2.prototype.refresh = function (callback) {
  this.client.getPoolv2(this.id, callback);
};

lbaasPoolsV2.prototype.update = function (callback) {
  this.client.updatePoolv2(this, callback);
};

lbaasPoolsV2.prototype.destroy = function (callback) {
  this.client.destroyPoolv2(this.id, callback);
};
