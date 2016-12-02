var util = require('util'),
    base = require('../../core/network/lbaasLoadbalancer'),

    _ = require('underscore');

//VIP prototype
var lbaasLoadbalancer = exports.lbaasLoadbalancer = function lbaasLoadbalancer(client, details) {
  base.lbaasLoadbalancer.call(this, client, details);
};

util.inherits(lbaasLoadbalancer, base.lbaasLoadbalancer);

lbaasLoadbalancer.prototype._setProperties = function (details) {

  this.admin_state_up = details.admin_state_up || this.admin_state_up;
  this.description = details.description || this.description;
  this.id = details.id || this.id;
  this.listeners = details.listeners || [];
  this.name = details.name || this.name;
  this.operating_status = details.operating_status || this.operating_status;
  this.provisioning_status = details.provisioning_status || this.provisioning_status;
  this.project_id = details.project_id || this.project_id;
  this.tenant_id = details.tenant_id || this.tenant_id;
  this.vip_address = details.vip_address || this.vip_address;
  this.vip_subnet_id = details.vip_subnet_id || this.vip_subnet_id;
  this.flavor = details.flavor || this.flavor;
  this.provider = details.provider || this.provider;
};

lbaasLoadbalancer.prototype.toJSON = function () {
  return _.pick(this, ['admin_state_up', 'description', 'id', 'listeners', 'name',
  'operating_status', 'provisioning_status', 'project_id', 'tenant_id', 'vip_address',
  'vip_subnet_id', 'flavor', 'provider']);
};
