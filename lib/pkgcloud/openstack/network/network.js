/*
 * network.js: Openstack Network object.
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var utile = require('utile'),
    base = require('../../core/network/network'),
    _ = require('underscore');

var Network = exports.Network = function Network(client, details) {
  base.Network.call(this, client, details);
};

utile.inherits(Network, base.Network);

Network.prototype._setProperties = function (details) {
  this.name = details.name || this.name;
  this.status = details.status || this.status;
  this.admin_state_up = details.admin_state_up || this.admin_state_up;
  this.id = details.id || this.id;
  this.shared = details.shared || this.shared || 0;
  this.tenant_id = details.tenant_id || this.tenant_id;
  this.subnets = details.subnets || this.subnets;
};

Network.prototype.toJSON = function () {
  return _.pick(this, ['name', 'id', 'status', 'shared',
  'tenant_id', 'subnets']);
};
