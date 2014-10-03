/*
 * events.js: Instance methods for working with stack events from OpenStack Orchestration
 *
 * (C) 2014 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 */
var request = require('request'),
  pkgcloud = require('../../../../../lib/pkgcloud'),
  errs = require('errs'),
  urlJoin = require('url-join'),
  util = require('util'),
  _ = require('underscore'),
  orchestration = pkgcloud.providers.openstack.orchestration;

var _urlPrefix = '/stacks';

/**
 * client.getEvent
 *
 * @description get the event for a provided stack, resource, and eventName
 *
 * @param {object|string}     stack         stack or stackName
 * @param {object|string}     resource      resource or resourceName
 * @param {string}            eventId       eventId to query for
 * @param {function}          callback      f(err, event)
 * @returns {*}
 */
exports.getEvent = function (stack, resource, eventId, callback) {
  var self = this;

  if (stack instanceof orchestration.Stack) {
    getEvent(stack);
  }
  else if (typeof stack === 'string') {
    self.getStack(stack, function (err, stack) {
      if (err) {
        callback(err);
        return;
      }

      getEvent(stack);
    });
  }

  function getEvent(stack) {
    return self._request({
      path: urlJoin(_urlPrefix, stack.name, stack.id, 'resources',
          resource instanceof orchestration.Resource ? resource.name : resource, 'events', eventId)
    }, function (err, body) {
      if (err) {
        return callback(err);
      }

      callback(null, body.event);

    });
  }
};

/**
 * client.getEvents
 *
 * @description get the list of stack events for a provided stack
 *
 * @param {object|string}     stack         stack or stackName to find events for
 * @param {function}          callback      f(err, events) where stacks is an array of Event
 * @returns {*}
 */
exports.getEvents = function(stack, callback) {
  var self = this;

  if (stack instanceof orchestration.Stack) {
    getEvents(stack);
  }
  else if (typeof stack === 'string') {
    self.getStack(stack, function (err, stack) {
      if (err) {
        callback(err);
        return;
      }

      getEvents(stack);
    });
  }

  function getEvents(stack) {
    return self._request({
      path: urlJoin(_urlPrefix, stack.name, stack.id, 'events')
    }, function (err, body) {
      if (err) {
        return callback(err);
      }

      callback(null, body.events);

    });
  }
};

/**
 * client.getResourceEvents
 *
 * @description get the list of stack events for a provided stack and resource
 *
 * @param {object|string}     stack         stack or stackName to find events for
 * @param {object|string}     resource      resource or resourceName to find events for
 * @param {function}          callback      f(err, events) where stacks is an array of Event
 * @returns {*}
 */
exports.getResourceEvents = function (stack, resource, callback) {
  var self = this;

  if (stack instanceof orchestration.Stack) {
    getEvents(stack);
  }
  else if (typeof stack === 'string') {
    self.getStack(stack, function (err, stack) {
      if (err) {
        callback(err);
        return;
      }

      getEvents(stack);
    });
  }

  function getEvents(stack) {
    return self._request({
      path: urlJoin(_urlPrefix, stack.name, stack.id, 'resources',
        resource instanceof orchestration.Resource ? resource.name : resource, 'events')
    }, function (err, body) {
      if (err) {
        return callback(err);
      }

      callback(null, body.events);

    });
  }
};
