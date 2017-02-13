/*
 * oldsample.js: OpenStack Ceilometer Samples used by meters
 *
 * (C) 2015 Hans Cornelis
 *
 * MIT LICENSE
 *
 */

var util = require('util'),
    base = require('../../core/base/index'),
    _    = require('underscore');

var oldSample = exports.oldSample = function oldSample(client, details) {
  base.Model.call(this, client, details);
};

util.inherits(oldSample, base.Model);

oldSample.prototype._setProperties = function (details) {
  this.counter_name = details.counter_name;
  this.counter_type = details.counter_type;
  this.counter_unit = details.counter_unit;
  this.counter_volume = details.counter_volume;
  this.message_id = details.message_id;
  this.project_id = details.project_id;
  this.recorded_at = details.recorded_at;
  this.resource_id = details.resource_id;
  this.resource_metadata = details.resource_metadata;
  this.timestamp = details.timestamp;
  this.user_id = details.user_id;
};

oldSample.prototype.toJSON = function () {
  return _.pick(this, ['counter_name', 'counter_type', 'counter_unit',
    'counter_volume', 'message_id', 'project_id', 'recorded_at', 'resource_id',
    'resource_metadata', 'timestamp', 'user_id']);
};


