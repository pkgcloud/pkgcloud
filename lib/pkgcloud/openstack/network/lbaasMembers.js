/*
 * lbaasMembers.js: Openstack lbaas
 *
 * (C) Hopebay Tech
 *
 */


var util = require('util'),
    base = require('../../core/network/lbaasMembers'),

    _ = require('underscore');

//VIP prototype
var lbaasMembers = exports.lbaasMembers = function lbaasMembers(client, details) {
  base.lbaasMembers.call(this, client, details);
};

util.inherits(lbaasMembers, base.lbaasMembers);

lbaasMembers.prototype._setProperties = function (details) {
  this.status = details.status || this.status;
  this.weight = details.weight || this.weight;
  this.adminStateUp = details.admin_state_up || this.adminStateUp;
  this.tenantId = details.tenant_id || this.tenantId;
  this.pool_id = details.pool_id || this.pool_id;
  this.address = details.address || this.address;
  this.protocol_port = details.protocol_port || this.protocol_port;
  this.id = details.id || this.id;

};

lbaasMembers.prototype.toJSON = function () {
  return _.pick(this, ['status', 'weight', 'adminStateUp', 'tenantId',
  'pool_id', 'address', 'tenantId', 'protocol_port',
  'id']);
};