/*
 * lbaasMembers.js: pool operations for lbaas
 *
 * (C) 2015 Hopebay tech
 *
 */

var util = require('util'),
    model = require('../base/model');

var lbaasMembers = exports.lbaasMembers = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(lbaasMembers, model.Model);

lbaasMembers.prototype.create = function (callback) {
  this.client.createopLoadBalancer(this.name, callback);
};

lbaasMembers.prototype.refresh = function (callback) {
  this.client.getopLoadBalancer(this.id, callback);
};

lbaasMembers.prototype.update = function (callback) {
  this.client.updateopLoadBalancer(this, callback);
};

lbaasMembers.prototype.destroy = function (callback) {
  this.client.destroyopLoadBalancer(this.id, callback);
};
