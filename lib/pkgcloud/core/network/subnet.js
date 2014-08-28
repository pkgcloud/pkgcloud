/*
 * subnet.js: Base subnet from which all pkgcloud subnet inherit.
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var util = require('util'),
    model = require('../base/model');

var Subnet = exports.Subnet = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(Subnet, model.Model);

Subnet.prototype.create = function (callback) {
  this.client.createSubnet(this.name, callback);
};

Subnet.prototype.refresh = function (callback) {
  this.client.getSubnet(this.id, callback);
};

Subnet.prototype.update = function (callback) {
  this.client.updateSubnet(this, callback);
};

Subnet.prototype.destroy = function (callback) {
  this.client.destroySubnet(this.id, callback);
};
