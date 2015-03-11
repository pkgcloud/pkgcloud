/*
 * network.js: Openstack Security Group object.
 *
 * (C) 2015 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

var util = require('util'),
    base = require('../../core/network/securityGroup'),
    _ = require('underscore');

var SecurityGroup = exports.SecurityGroup = function SecurityGroup(client, details) {
  base.SecurityGroup.call(this, client, details);
};

util.inherits(SecurityGroup, base.SecurityGroup);

SecurityGroup.prototype._setProperties = function (details) {

  this.id = details.id || this.id;
  this.name = details.name || this.name;
  this.description = details.description || this.id;
  this.tenantId = details.tenant_id || this.tenantId;
  this.securityGroupRules = details.security_group_rules || this.securityGroupRules;
};

SecurityGroup.prototype.toJSON = function () {
  return _.pick(this, ['id', 'name', 'description', 'securityGroupRules', 'tenantId']);
};
