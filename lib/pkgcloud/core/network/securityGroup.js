/*
 * securityGroup.js: Base securityGroup from which all pkgcloud securityGroup inherit.
 *
 * (C) 2015 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

var util = require('util'),
    Model = require('../base/model').Model;

var SecurityGroup = exports.SecurityGroup = function (client, details) {
  Model.call(this, client, details);
};

util.inherits(SecurityGroup, Model);

SecurityGroup.prototype.create = function (callback) {
  this.client.createSecurityGroup(this, callback);
};

SecurityGroup.prototype.refresh = function (callback) {
  this.client.getSecurityGroup(this.id, callback);
};

SecurityGroup.prototype.destroy = function (callback) {
  this.client.destroySecurityGroup(this.id, callback);
};
