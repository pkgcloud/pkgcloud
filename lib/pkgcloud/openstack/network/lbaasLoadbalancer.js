var util = require('util'),
    base = require('../../core/network/lbaasLoadbalancers'),

    _ = require('underscore');

//VIP prototype
var lbaasLoadbalancers = exports.lbaasLoadbalancers = function lbaasLoadbalancers(client, details) {
  base.lbaasLoadbalancers.call(this, client, details);
};

util.inherits(lbaasLoadbalancers, base.lbaasLoadbalancers);

lbaasLoadbalancers.prototype._setProperties = function (details) {

  this.admin_state_up = details.admin_state_up || this.admin_state_up;
  this.description = details.description || this.description;
  this.id = details.id || this.id;
  this.listeners = details.listeners || [];
  this.name = details.name || this.name;
  this.operating_status = details.operating_status || this.operating_status;
  this.provisioning_status = details.provisioning_status || this.provisioning_status;
  this.tenant_id = details.tenant_id || this.tenant_id;
  this.vip_address = details.vip_address || this.vip_address;
  this.vip_subnet_id = details.vip_subnet_id || this.vip_subnet_id;
  this.flavor = details.flavor || this.flavor;
  this.provider = details.provider || this.provider;
};

lbaasLoadbalancers.prototype.toJSON = function () {
  return _.pick(this, ['admin_state_up', 'id', 'listeners', 'name',
  'operating_status', 'provisioning_status', 'tenant_id', 'vip_address',
  'vip_subnet_id', 'flavor', 'provider']);
};
