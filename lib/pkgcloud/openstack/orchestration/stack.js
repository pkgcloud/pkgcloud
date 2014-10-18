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
    _     = require('underscore');

var Stack = exports.Stack = function Stack(client, details) {
  base.Model.call(this, client, details);
};

util.inherits(Stack, base.Model);

Stack.prototype._setProperties = function (details) {
  this.id = details.id;
  this.name = details.name || details['stack_name'];
  this.status = details.status || details['stack_status'];
  this.description = details.description;
  this.templateDescription = details.templateDescription || details['template_description'];
  this.statusReason = details.statusReason || details['stack_status_reason'];
  this.owner = details.owner || details['stack_owner'];
  this.disableRollback = details.disableRollback || details['disable_rollback'];
  this.parameters = details.parameters;
  this.capabilities = details.capabilities;
  this.notificationTopics = details.notificationTopics || details['notification_topics'];
  this.timeout = details.timeout || details['timeout_mins'];

  this.createdAt = details['creation_time'];
  this.updatedAt = details['updated_time'];
};

Stack.prototype.toJSON = function () {
  return _.pick(this, ['id', 'name', 'status', 'description', 'templateDescription', 'statusReason', 'owner',
    'disableRollback', 'parameters', 'capabilities', 'notificationTopics', 'timeout', 'updatedAt', 'createdAt' ]);
};





