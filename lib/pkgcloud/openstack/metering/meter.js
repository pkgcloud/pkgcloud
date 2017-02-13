/*
 * meter.js: OpenStack Ceilometer meters
 *
 * (C) 2015 Hans Cornelis
 *
 * MIT LICENSE
 *
 */

var util = require('util'),
    base = require('../../core/base/index'),
    _    = require('underscore');

var Meter = exports.Meter = function Meter(client, details) {
  base.Model.call(this, client, details);
};

util.inherits(Meter, base.Model);

Meter.prototype._setProperties = function (details) {
  this.meter_id = details.meter_id;
  this.name = details.name;
  this.project_id = details.project_id;
  this.resource_id = details.resource_id;
  this.source = details.source;
  this.type = details.type;
  this.unit = details.unit;
};

Meter.prototype.toJSON = function () {
  return _.pick(this, ['meter_id', 'name', 'project_id', 'resource_id', 'source', 'type', 'unit']);
};


