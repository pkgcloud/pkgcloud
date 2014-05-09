/*
 * network.js: Openstack Subnet object.
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var utile = require('utile'),
    base = require('../../core/network/subnet'),
    _ = require('underscore');

var Subnet = exports.Subnet = function Subnet(client, details) {
  base.Subnet.call(this, client, details);
};

utile.inherits(Subnet, base.Subnet);

Subnet.prototype._setProperties = function (details) {
  this.name = details.name || this.name;
  this.enable_dhcp = details.enable_dhcp || this.enable_dhcp;
  this.network_id = details.network_id || this.network_id;
  this.id = details.id || this.id;
  this.ip_version = details.ip_version || this.ip_version;
  this.tenant_id = details.tenant_id || this.tenant_id;
  this.gateway_ip = details.gateway_ip || this.gateway_ip;
  this.cidr = details.cidr || this.cidr;
  this.dns_nameservers = details.dns_nameservers || this.dns_nameservers;
};

Subnet.prototype.toJSON = function () {
  return _.pick(this, ['name', 'id', 'network_id', 'ip_version',
  'tenant_id', 'gateway_ip', 'dns_nameservers']);
};
