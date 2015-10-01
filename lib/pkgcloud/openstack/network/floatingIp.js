/*
 * network.js: Openstack Network object.
 *
 * (C) Hopebay tech
 *
 */

var util = require('util'),
    base = require('../../core/network/floatingIp'),
    _ = require('underscore');

var FloatingIp = exports.FloatingIp = function FloatingIp(client, details) {
  base.FloatingIp.call(this, client, details);
};

util.inherits(FloatingIp, base.FloatingIp);

FloatingIp.prototype._setProperties = function (details) {
  this.name = details.name || this.name;
  this.status = details.status || this.status;
  this.router_id = details.router_id;
  this.tenant_id = details.tenant_id || this.tenantId;
  this.floating_network_id = details.floating_network_id;
  this.fixed_ip_address = details.fixed_ip_address;
  this.port_id = details.port_id;
  this.id = details.id || this.id;
};

FloatingIp.prototype.toJSON = function () {
  return _.pick(this, ['name', 'id', 'router_id', 'status', 'shared',
  'tenant_id', 'floating_network_id', 'fixed_ip_address', 'port_id']);
};
