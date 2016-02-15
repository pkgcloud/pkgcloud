/*
 * alarm.js: OpenStack Ceilometer alarms
 *
 * (C) 2015 Hopebay Tech
 *
 * Rice Li
 *
 */

var util = require('util'),
    base = require('../../core/base/index'),
    _    = require('underscore');

var AlarmHistory = exports.AlarmHistory = function AlarmHistory(client, details) {
  base.Model.call(this, client, details);
};

util.inherits(AlarmHistory, base.Model);

AlarmHistory.prototype._setProperties = function (details) {
  this.on_behalf_of = details.on_behalf_of;
  this.user_id = details.user_id;
  this.event_id = details.event_id;
  this.timestamp = details.timestamp;
  this.detail = details.detail;
  this.alarm_id = details.alarm_id;
  this.project_id = details.project_id;
  this.type = details.type;
};

AlarmHistory.prototype.toJSON = function () {
  return _.pick(this, ['on_behalf_of', 'user_id', 'timestamp', 'detail', 'alarm_id', 'project_id', 'type']);
};
