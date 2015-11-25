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
    _ = require('underscore');

var Alarm = exports.Alarm = function Alarm(client, details) {
    base.Model.call(this, client, details);
};

util.inherits(Alarm, base.Model);

Alarm.prototype._setProperties = function (details) {
    this.alarm_id = details.alarm_id;
    this.name = details.name;
    this.project_id = details.project_id;
    this.user_id = details.user_id;
    this.alarm_actions = details.alarm_actions;
    this.type = details.type;
    this.ok_actions = details.ok_actions;
    this.timestamp = details.timestamp;
    this.description = details.description;
    this.time_constraints = details.time_constraints;
    this.enabled = details.enabled;
    this.state_timestamp = details.state_timestamp;
    this.threshold_rule = details.threshold_rule;
    this.state = details.state;
    this.insufficient_data_actions = details.insufficient_data_actions;
    this.repeat_actions = details.repeat_actions;
    this.serverity = details.serverity;    
};

Alarm.prototype.toJSON = function () {
    return _.pick(this, ['alarm_id', 'name', 'project_id', 'user_id', 'alarm_action', 'type', 'ok_actions', 'timestamp', 'description', 'time_constraints', 'enabled', 'state_timestamp', 'threshold_rule', 'state', 'insufficient_data_action', 'repeat_actions', 'serverity']);
};
