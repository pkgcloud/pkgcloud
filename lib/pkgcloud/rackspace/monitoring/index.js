/*
 * index.js: Top-level include for the Rackspace Cloud LoadBalancers module
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

exports.Client = require('./client').Client;
exports.Entity = require('./entity').Entity;
exports.Check = require('./check').Check;
exports.Alarm = require('./alarm').Alarm;
exports.Notification = require('./notification').Notification;
exports.NotificationPlan = require('./notification_plan').NotificationPlan;

exports.createClient = function (options) {
  return new exports.Client(options);
};
