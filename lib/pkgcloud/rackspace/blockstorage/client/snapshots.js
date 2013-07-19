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

exports.getSnapshots = function (detailed, callback) {
  var self = this,
      path = _urlPrefix;

  if (typeof detailed === 'function') {
    callback = detailed;
  }
  else if (detailed) {
    path = urlJoin(_urlPrefix, 'details');
  }

  return self.request({
    path: path
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.snapshots.map(function (data) {
      return new Snapshot(self, data);
    }), res);
  });
};

exports.getSnapshot = function (snapshot, callback) {
  var self = this,
      snapshotId = snapshot instanceof Snapshot ? snapshot.id : snapshot;

  return self.request({
    path: urlJoin(_urlPrefix, snapshotId)
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, new Snapshot(self, body.snapshot));
  });
};

exports.createSnapshot = function(options, callback) {
  var self = this;

  var createOptions = {
    method: 'POST',
    path: _urlPrefix,
    body: {
      name: options.name,
      description: options.description,
      force: typeof options.force === 'boolean' ? options.force : false,
      'volume_id': options.volumeId
    }
  };

  self.request(createOptions, function(err, body, res) {
    console.dir(body);
    return err
      ? callback(err)
      : callback(null, new Snapshot(self, body.snapshot));
  });
};

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

  self.request(updateOptions, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, new Snapshot(self, body.snapshot));
  });
};

exports.deleteSnapshot = function (snapshot, callback) {
  var snapshotId = snapshot instanceof Snapshot ? snapshot.id : snapshot;

  return this.request({
    path: urlJoin(_urlPrefix, snapshotId),
    method: 'DELETE'
  }, function (err) {
    return err
      ? callback(err)
      : callback(null, true);
  });
};