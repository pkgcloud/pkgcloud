/*
 * snapshots.js: Instance methods for working with SnapShots from OpenStack Block Storage
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 *
 */
var errs = require('errs'),
    Snapshot = require('../snapshot').Snapshot,
    urlJoin = require('url-join');

var _urlPrefix = 'snapshots';

/**
 * client.getSnapshots
 *
 * @description Get the Snapshots for an account
 * @memberof rackspace/blockstorage
 *
 * @param {Boolean}     [options]       Get the full details for the Snapshots
 * @param {Function}    callback ( error, snapshots )
 */
exports.getSnapshots = function (options, callback) {
  var self = this,
      path = _urlPrefix;

  if (typeof options === 'function') {
    callback = options;
  }
  else if ((typeof options === 'boolean') && (options)) {
    path = urlJoin(_urlPrefix, 'details');
  }

  return self._request({
    path: path
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.snapshots.map(function (data) {
      return new Snapshot(self, data);
    }), res);
  });
};

/**
 * client.getSnapshot
 *
 * @description Get the details for a specific Snapshot
 * @memberof rackspace/blockstorage
 *
 * @param {object|String}   snapshot    The ID or instance of the Snapshot
 * @param {Function}        callback ( error, snapshot )
 */
exports.getSnapshot = function (snapshot, callback) {
  var self = this,
      snapshotId = snapshot instanceof Snapshot ? snapshot.id : snapshot;

  return self._request({
    path: urlJoin(_urlPrefix, snapshotId)
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, new Snapshot(self, body.snapshot));
  });
};

/**
 * client.createSnapshot
 *
 * @description Creates a Snapshot from the provided options
 * @memberof rackspace/blockstorage
 *
 * @param {object}      details
 * @param {String}      details.name            The name of the new Snapshot
 * @param {String}      details.description     The description for the new Snapshot
 * @param {String}      details.volumeId        The volumeId for the new Snapshot
 * @param {Boolean}     [details.force=false]   Force creation of the Snapshot
 * @param {Function}    callback ( error, snapshot )
 */
exports.createSnapshot = function(details, callback) {
  var self = this;

  var createOptions = {
    method: 'POST',
    path: _urlPrefix,
    body: {
      snapshot: {
        name: details.name,
        description: details.description,
        force: typeof details.force === 'boolean' ? details.force : false,
        'volume_id': details.volumeId
      }
    }
  };

  self._request(createOptions, function(err, body, res) {
    return err
      ? callback(err)
      : callback(null, new Snapshot(self, body.snapshot));
  });
};

/**
 * client.updateSnapshot
 *
 * @description Updates a Snapshot from a current instance
 * @memberof rackspace/blockstorage
 *
 * @param {object}              snapshot
 * @param {String}              snapshot.id             The ID of the Snapshot to update
 * @param {String}              snapshot.name           The name of the updated Snapshot
 * @param {String}              snapshot.description    The description for the updated Snapshot
 * @param {Function}            callback ( error, snapshot )
 */
exports.updateSnapshot = function (snapshot, callback) {
  var self = this,
      snapshotId = snapshot instanceof Snapshot ? snapshot.id : snapshot;

  var updateOptions = {
    method: 'PUT',
    path: urlJoin(_urlPrefix, snapshotId),
    body: {
      name: snapshot.name,
      description: snapshot.description
    }
  };

  self._request(updateOptions, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, new Snapshot(self, body.snapshot));
  });
};

/**
 * client.deleteSnapshot
 *
 * @description Deletes a Snapshot
 * @memberof rackspace/blockstorage
 *
 * @param {object|String}     snapshot   The ID or instance of the Snapshot
 * @param {Function}          callback ( error, true ) 
 */
exports.deleteSnapshot = function (snapshot, callback) {
  var snapshotId = snapshot instanceof Snapshot ? snapshot.id : snapshot;

  return this._request({
    path: urlJoin(_urlPrefix, snapshotId),
    method: 'DELETE'
  }, function (err) {
    return err
      ? callback(err)
      : callback(null, true);
  });
};
