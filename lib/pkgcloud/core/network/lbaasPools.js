/*
 * lbaaspools.js: pool operations for lbaas
 *
 * (C) 2015 Hopebay tech
 *
 */

var util = require('util'),
    model = require('../base/model');

var lbaasPools = exports.lbaasPools = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(lbaasPools, model.Model);

lbaasPools.prototype.create = function (callback) {
  this.client.createopLoadBalancer(this.name, callback);
};

lbaasPools.prototype.refresh = function (callback) {
  this.client.getopLoadBalancer(this.id, callback);
};

lbaasPools.prototype.update = function (callback) {
  this.client.updateopLoadBalancer(this, callback);
};

lbaasPools.prototype.destroy = function (callback) {
  this.client.destroyopLoadBalancer(this.id, callback);
};
