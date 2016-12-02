var util = require('util'),
    base = require('../../core/network/lbaasPoolsV2'),

    _ = require('underscore');

//VIP prototype
var lbaasPoolsV2 = exports.lbaasPoolsV2 = function lbaasPoolsV2(client, details) {
  base.lbaasPoolsV2.call(this, client, details);
};

util.inherits(lbaasPoolsV2, base.lbaasPoolsV2);

lbaasPoolsV2.prototype._setProperties = function (details) {

  this.admin_state_up = details.admin_state_up || this.admin_state_up;
  this.description = details.description || this.description;
  this.lb_algorithm = details.lb_algorithm || this.lb_algorithm;
  this.listener_id = details.listener_id || this.listener_id;
  this.name = details.name || this.name;
  this.project_id = details.project_id || this.project_id;
  this.protocol = details.protocol || this.protocol;
  this.subnet_id = details.subnet_id || this.subnet_id;
  this.tenant_id = details.tenant_id || this.tenant_id;

};

lbaasPoolsV2.prototype.toJSON = function () {
  return _.pick(this, ['admin_state_up', 'description', 'lb_algorithm', 'listener_id',
  'name', 'project_id', 'protocol', 'subnet_id','tenant_id']);
};
