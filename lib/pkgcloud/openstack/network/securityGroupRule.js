/*
 * network.js: Openstack Security Group Rule object.
 *
 * (C) 2015 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

var util = require('util'),
    base = require('../../core/network/securityGroupRule'),
    _ = require('underscore');

var SecurityGroupRule = exports.SecurityGroupRule = function SecurityGroupRule(client, details) {
  base.SecurityGroupRule.call(this, client, details);
};

util.inherits(SecurityGroupRule, base.SecurityGroupRule);

SecurityGroupRule.prototype._setProperties = function (details) {
  this.id = details.id || this.id;
  this.direction = details.direction || this.direction;
  this.ethertype = details.ethertype || this.id;
  this.securityGroupId = details.security_group_id || this.securityGroupId;
  this.portRangeMin = details.port_range_min || this.portRangeMin;
  this.portRangeMax = details.port_range_max || this.portRangeMax;
  this.protocol = details.protocol || this.protocol;
  this.remoteGroupId = details.remote_group_id || this.remoteGroupId;
  this.remoteIpPrefix = details.remote_ip_prefix || this.remoteIpPrefix;
  this.tenantId = details.tenant_id || this.tenantId;
};

SecurityGroupRule.prototype.toJSON = function () {
  return _.pick(this, ['id', 'direction', 'ethertype', 'securityGroupId',
                       'portRangeMin', 'portRangeMax', 'protocol',
                       'remoteGroupId', 'remoteIpPrefix', 'tenantId']);
};
