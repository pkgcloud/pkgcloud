/*
 * lbaasHealthMonitor.js: Openstack lbaas
 *
 * (C) Hopebay Tech
 *
 */



var util = require('util'),
    base = require('../../core/network/lbaasHealthMonitor'),

    _ = require('underscore');

//VIP prototype
var HealthMonitor = exports.HealthMonitor = function HealthMonitor(client, details) {
  base.HealthMonitor.call(this, client, details);
};

util.inherits(HealthMonitor, base.HealthMonitor);
HealthMonitor.prototype._setProperties = function (details) {
  this.id = details.id || this.id;
  this.tenantId = details.tenant_id || this.tenantId;
  this.type = details.type || this.type;
  this.delay = details.delay || this.delay;
  this.timeout = details.timeout || this.timeout;
  this.max_retries = details.max_retries || this.max_retries;
  this.http_method  = details.http_method || this.http_method;
  this.url_path = details.url_path || this.url_path;
  this.expected_codes = details.expected_codes || this.expected_codes;
  this.status = details.status || this.status;
  this.adminStateUp = details.admin_state_up || this.adminStateUp;
};

HealthMonitor.prototype.toJSON = function () {
  return _.pick(this, ['id', 'tenantId', 'name', 'type',
  'delay', 'timeout', 'max_retries', 'http_method',
  'url_path', 'expected_codes', 'status', 'adminStateUp']);
};
