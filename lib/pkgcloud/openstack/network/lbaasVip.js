/*
 * opLoadBalancer.js: Openstack lbaas
 *
 * (C) Hopebay Tech
 *
 */

var util = require('util'),
    base = require('../../core/network/lbaasVip'),

    _ = require('underscore');

//VIP prototype
var lbaasVip = exports.lbaasVip = function lbaasVip(client, details) {
  base.lbaasVip.call(this, client, details);
};

util.inherits(lbaasVip, base.lbaasVip);

lbaasVip.prototype._setProperties = function (details) {

  this.id = details.id || this.id;
  this.tenantId = details.tenant_id || this.tenantId;
  this.name = details.name || this.name;
  this.description = details.description || this.description;
  this.subnet_id = details.subnet_id || this.subnet_id;
  this.port_id = details.port_id || this.port_id;
  this.address = details.address || this.address;
  this.protocol = details.protocol || this.protocol;
  this.protocol_port = details.protocol_port || this.protocol_port;
  this.pool_id = details.pool_id || this.pool_id;
  this.session_persistence = details.session_persistence || this.session_persistence;
  this.connection_limit = details.connection_limit   || this.connection_limit;
  this.adminStateUp = details.admin_state_up || this.adminStateUp;
  this.status = details.status || this.status;
};

lbaasVip.prototype.toJSON = function () {
  return _.pick(this, ['id', 'tenantId', 'name', 'description',
  'subnet_id', 'port_id', 'address', 'protocol',
  'protocol_port', 'pool_id', 'session_persistence', 'connection_limit', 'adminStateUp', 'status']);
};


//health monitor
/*
var HealthMonitor = exports.HealthMonitor = function HealthMonitor(client, details) {
  base.opLoadBalancer.call(this, client, details);
};

util.inherits(HealthMonitor, base.opLoadBalancer);

HealthMonitor.prototype._setProperties = function (details) {

  this.status = details.status || this.status;
  this.name = details.name || this.name;
  this.allowedAddressPairs = details.allowed_address_pairs   || this.allowedAddressPairs;
  this.adminStateUp = details.admin_state_up || this.adminStateUp;
  this.networkId = details.network_id || this.networkId;
  this.tenantId = details.tenant_id || this.tenantId;
  this.extraDhcpOpts = details.extra_dhcp_opts || this.extraDhcpOpts;
  this.deviceOwner = details.device_owner || this.deviceOwner;
  this.macAddress = details.mac_address || this.macAddress;
  this.fixedIps = details.fixed_ips || this.fixedIps;
  this.id = details.id || this.id;
  this.securityGroups = details.security_groups || this.securityGroups;
  this.deviceId = details.device_id || this.deviceId;
};

HealthMonitor.prototype.toJSON = function () {
  return _.pick(this, ['status', 'name', 'allowedAddressPairs', 'adminStateUp',
  'networkId', 'tenantId', 'extraDhcpOpts', 'deviceOwner',
  'macAddress', 'fixedIps', 'id', 'securityGroups', 'deviceId']);
};
*/



