/**
 * Created by Ali Bazlamit on 8/28/2017.
 */

var Snapshot = require('../snapshot').Snapshot,
  oneandone = require('liboneandone-2'),
  Server = require('../../compute/server').Server;
/**
 * client.getSnapshots
 *
 * @description Returns a list of the server's snapshots.
 *
 * @param {function} callback
 * @returns {*}
 */
exports.getSnapshots = function (server, callback) {
  var self = this,
    serverId = server instanceof Server ? server.id : server;
  oneandone.listSnapshots(serverId, function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 200) {
      callback(JSON.parse(body));
      return;
    }
    var object = JSON.parse(body);
    var result = [];
    if (object instanceof Array) {
      result = object;
    } else {
      result.push(object);
    }
    callback(null, result.map(function (data) {
      return new Snapshot(self, data);
    }));
  });
};

/**
 * client.createSnapshot
 *
 * @description Creates a new snapshot of the server.
 *
 * @param {string}      server    Server or Server id to create the snapshot from
 * @param {function}    callback
 * @returns {*}
 */
exports.createSnapshot = function (server, callback) {
  var serverId = server instanceof Server ? server.id : server;

  oneandone.createSnapshot(serverId, function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 202) {
      callback(JSON.parse(body));
      return;
    }
    var snapshot = JSON.parse(body);
    callback(null, snapshot.snapshot);
  });
};

/**
 * client.updateSnapshot
 *
 * @description Restores a snapshot into the server.
 *
 * @param {string}      options.server    Server or Server id to restore the snapshot into
 * @param {string}      options.snapshot  snapshot or snapshot id to restore into the server provided
 * @param {function}    callback
 * @returns {*}
 */
exports.updateSnapshot = function (options, callback) {
  var self = this;
  var serverId = options.server instanceof Server ? options.server.id : options.server,
    snapshotId = options.snapshot instanceof Object ? options.snapshot.id : options.snapshot;

  oneandone.restoreSnapshot(serverId, snapshotId, function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 202) {
      callback(JSON.parse(body));
      return;
    }
    var snp = JSON.parse(body);
    callback(null, new Snapshot(self, snp));
  });
};

/**
 * client.deleteSnapshot
 *
 * @description Removes a snapshot
 * @param {string}      options.server    Server or Server id to restore the snapshot into
 * @param {string}      options.snapshot  snapshot or snapshot id to restore into the server provided
 * @param {function}          callback
 * @returns {*}
 */
exports.deleteSnapshot = function (options, callback) {
  var self = this;
  var serverId = options.server instanceof Server ? options.server.id : options.server,
    snapshotId = options.snapshot instanceof Object ? options.snapshot.id : options.snapshot;

  oneandone.deleteSnapshot(serverId, snapshotId, function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 202) {
      callback(JSON.parse(body));
      return;
    }
    var snp = JSON.parse(body);
    callback(null, new Snapshot(self, snp));
  });
};