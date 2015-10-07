/*
 * lbaasPools.js: Openstack lbaas
 *
 * (C) Hopebay Tech
 *
 */



var util = require('util'),
    base = require('../../core/network/lbaasPools'),

    _ = require('underscore');

//VIP prototype
var lbaasPools = exports.lbaasPools = function lbaasPools(client, details) {
  base.lbaasPools.call(this, client, details);
};

util.inherits(lbaasPools, base.lbaasPools);

lbaasPools.prototype._setProperties = function (details) {

  this.status = details.status || this.status;
  this.lb_method = details.lb_method || this.lb_method;
  this.protocol = details.protocol || this.protocol;
  this.description = details.description || this.description;
  this.health_monitors = details.health_monitors || [];
  this.subnet_id = details.subnet_id || this.subnet_id;
  this.tenantId = details.tenant_id || this.tenantId;
  this.adminStateUp = details.admin_state_up || this.adminStateUp;
  this.name = details.name || this.name;
  this.members = details.members || this.members;
  this.id = details.id || this.id;
  this.vip_id = details.vip_id || this.vip_id;
};

lbaasPools.prototype.toJSON = function () {
  return _.pick(this, ['status', 'lb_method', 'protocol', 'description',
  'health_monitors', 'subnet_id', 'tenantId', 'adminStateUp',
  'name', 'members', 'id', 'vip_id']);
};