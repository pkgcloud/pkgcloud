var util = require('util'),
    base = require('../../core/network/lbaasHealthMonitorV2'),

    _ = require('underscore');

//VIP prototype
var lbaasHealthMonitorV2 = exports.lbaasHealthMonitorV2 = function lbaasHealthMonitorV2(client, details) {
  base.lbaasHealthMonitorV2.call(this, client, details);
};

util.inherits(lbaasHealthMonitorV2, base.lbaasHealthMonitorV2);

lbaasHealthMonitorV2.prototype._setProperties = function (details) {

  this.admin_state_up = details.admin_state_up || this.admin_state_up;
  this.delay = details.delay || this.delay;
  this.expected_codes = details.expected_codes || this.expected_codes;
  this.max_retries = details.max_retries || this.max_retries;
  this.http_method = details.http_method || this.http_method;
  this.timeout = details.timeout || this.timeout;
  this.pools = details.pools || this.pools;
  this.url_path = details.url_path || this.url_path;
  this.type = details.type || this.type;
  this.id = details.it || this.id;
};

lbaasHealthMonitorV2.prototype.toJSON = function () {
  return _.pick(this, ['admin_state_up', 'delay', 'expected_codes', 'max_retries',
  'http_method', 'timeout', 'pools', 'url_path', 'type', 'id']);
};
