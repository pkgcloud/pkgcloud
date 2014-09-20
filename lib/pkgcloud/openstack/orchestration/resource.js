/*
 * volume.js: OpenStack Orchestration Stack
 *
 * (C) 2014 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var util  = require('util'),
    base  = require('../../core/base'),
    Stack = require('./stack').Stack,
    _     = require('underscore');

var Resource = exports.Resource = function Stack(client, details) {
  base.Model.call(this, client, details);
};

util.inherits(Resource, base.Model);

Resource.prototype._setProperties = function (details) {
  this.name = details.name || details['resource_name'];
  this.status = details.status || details['resource_status'];
  this.stack = details.stack;
  this.statusReason = details.statusReason || details['resource_status_reason'];
  this.type = details.type || details['resource_type'];
  this.logicalResourceId = details.logicalResourceId || details['logical_resource_id'];
  this.physicalResourceId = details.physicalResourceId || details['physical_resource_id'];
  this.requiredBy = details.requiredBy || details['required_by'];
  this.updatedAt = details.updatedAt || details['updated_time'];
  this.links = details.links;
};

Resource.prototype.toJSON = function () {

  var data = _.pick(this, ['name', 'status', 'statusReason', 'type', 'logicalResourceId', 'physicalResourceId',
    'requiredBy', 'updatedAt', 'links']);

  this.stack instanceof Stack ? data.stack = this.stack.toJSON() : {};

  return data;

};





