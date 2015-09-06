/*
 * instance-actions.js: OpenStack Compute instace action logs
 *
 * (C) 2015 Hope Bay Technologies, Inc.
 *      Joe Chen
 * MIT LICENSE
 *
 */

var Server = require('../../server').Server,
    urlJoin = require('url-join');

var _urlPrefix = '/servers',
    _extension = 'os-instance-actions';

/**
 * client.getActionLogs
 *
 * @description Get the action logs for a server
 *
 * @param {object|String}   server    The server or serverId to get action logs for
 * @param {function}        callback
 * @returns {*}
 */
exports.getActionLogs = function(server, callback) {
  var serverId = server instanceof Server ? server.id : server;

  return this._request({
    path: urlJoin(_urlPrefix, serverId, _extension)
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.instanceActions, res);
  });
};

/**
 * client.getActionLogDetails
 *
 * @description Get the details of an action log from a server
 *
 * @param {object|String}   server    The server or serverId for the volume
 * @param {object|String}   actionLogId    The actionLogId to get details for
 * @param {function}        callback
 * @returns {*}
 */
exports.getActionLogDetails = function(server, actionLogId, callback) {
  var serverId = server instanceof Server ? server.id : server;

  return this._request({
    path: urlJoin(_urlPrefix, serverId, _extension, actionLogId)
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.instanceAction, res);
  });
};

