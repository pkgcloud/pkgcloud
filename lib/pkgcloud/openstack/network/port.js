/*
 * network.js: Openstack Port object.
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var utile = require('utile'),
    base = require('../../core/network/port'),
    _ = require('underscore');

var Port = exports.Port = function Port(client, details) {
  base.Port.call(this, client, details);
};

utile.inherits(Port, base.Port);

Port.prototype._setProperties = function (details) {

  this.status = details.status || this.status;
  this.name = details.name || this.name;
  this.allowed_address_pairs = details.allowed_address_pairs	 || this.allowed_address_pairs;
  this.admin_state_up = details.admin_state_up || this.admin_state_up;
  this.network_id = details.network_id || this.network_id;
  this.tenant_id = details.tenant_id || this.tenant_id;
  this.extra_dhcp_opts = details.extra_dhcp_opts || this.extra_dhcp_opts;
  this.device_owner = details.device_owner || this.device_owner;
  this.mac_address = details.mac_address || this.mac_address;
  this.fixed_ips = details.fixed_ips || this.fixed_ips;
  this.id = details.id || this.id;
  this.security_groups = details.security_groups || this.security_groups;
  this.device_id = details.device_id || this.device_id;
};

Port.prototype.toJSON = function () {
  return _.pick(this, ['status', 'name', 'allowed_address_pairs', 'admin_state_up',
  'network_id', 'tenant_id', 'extra_dhcp_opts', 'device_owner',
  'mac_address', 'fixed_ips', 'id', 'security_groups', 'device_id']);
};
