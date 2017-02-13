/*
 * network.js: Base network from which all pkgcloud networks inherit.
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var util = require('util'),
    model = require('../base/model');

var lbaasVip = exports.lbaasVip = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(lbaasVip, model.Model);

lbaasVip.prototype.create = function (callback) {
  this.client.createopLoadBalancer(this.name, callback);
};

lbaasVip.prototype.refresh = function (callback) {
  this.client.getopLoadBalancer(this.id, callback);
};

lbaasVip.prototype.update = function (callback) {
  this.client.updateopLoadBalancer(this, callback);
};

lbaasVip.prototype.destroy = function (callback) {
  this.client.destroyopLoadBalancer(this.id, callback);
};
