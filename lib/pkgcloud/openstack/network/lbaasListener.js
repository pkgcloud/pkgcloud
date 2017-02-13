var util = require('util'),
    base = require('../../core/network/lbaasListener'),

    _ = require('underscore');

//VIP prototype
var lbaasListener = exports.lbaasListener = function lbaasListener(client, details) {
  base.lbaasListener.call(this, client, details);
};

util.inherits(lbaasListener, base.lbaasListener);

lbaasListener.prototype._setProperties = function (details) {

  this.admin_state_up = details.admin_state_up || this.admin_state_up;
  this.connection_limit = details.connection_limit || -1;
  this.default_pool_id = details.default_pool_id || this.default_pool_id;
  this.description = details.description || this.description;
  this.id = details.id || this.id;
  this.loadbalancers = details.loadbalancers || this.loadbalancers;
  this.name = details.name || this.name;
  this.protocol = details.protocol || this.protocol;
  this.protocol_port = details.protocol_port || this.protocol_port;
  this.project_id = details.project_id || this.project_id;
  this.tenant_id = details.tenant_id || this.tenant_id;
  if (details.protocol === 'TERMINATED_HTTPS'){
    this.default_tls_container_id = details.default_tls_container_id || this.default_tls_container_id
    this.sni_container_id = details.sni_container_id || this.sni_container_id ;
  }
};

lbaasListener.prototype.toJSON = function () {
  return _.pick(this, ['admin_state_up', 'connection_limit', 'default_pool_id', 'description', 'id',
  'loadbalancers', 'name', 'protocol', 'protocol_port', 'project_id', 'tenant_id', 'default_tls_container_ref',
  'sni_container_refs']);
};
