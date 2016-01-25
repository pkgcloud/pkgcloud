/*
 * securityGroupRule.js: Base securityGroupRule from which all pkgcloud securityGroupRule inherit.
 *
 * (C) 2015 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

var util = require('util'),
    Model = require('../base/model').Model;

var SecurityGroupRule = exports.SecurityGroupRule = function (client, details) {
  Model.call(this, client, details);
};

util.inherits(SecurityGroupRule, Model);

SecurityGroupRule.prototype.create = function (callback) {
  this.client.createSecurityGroupRule(this, callback);
};

SecurityGroupRule.prototype.refresh = function (callback) {
  this.client.getSecurityGroupRule(this.id, callback);
};

SecurityGroupRule.prototype.destroy = function (callback) {
  this.client.destroySecurityGroupRule(this.id, callback);
};
