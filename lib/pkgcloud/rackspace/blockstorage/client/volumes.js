/*
 * volumes.js: Instance methods for working with Volumes from CloudBlockStorage
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 *
 */
var errs = require('errs'),
    Volume = require('../volume').Volume,
    VolumeType = require('../volumetype').VolumeType,
    urlJoin = require('url-join');

var _urlPrefix = 'volumes';

exports.getVolumes = function (detailed, callback) {
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
      : callback(null, body.volumes.map(function (data) {
      return new Volume(self, data);
    }), res);
  });
};

exports.getVolume = function (volume, callback) {
  var self = this,
    volumeId = volume instanceof Volume ? volume.id : volume;

  return self.request({
    path: urlJoin(_urlPrefix, volumeId)
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, new Volume(self, body.volume));
  });
};

exports.createVolume = function (options, callback) {
  var self = this;

  var createOptions = {
    method: 'POST',
    path: _urlPrefix,
    body: {
      volume: {
        'display_name': options.name,
        'display_description': options.description,
        size: options.size
      }
    }
  };

  if (options.volumeType) {
    createOptions.body.volume['volume_type'] =
      options.volumeType instanceof VolumeType
        ? options.volumeType.name
        : options.volumeType;
  }

  if (options.snapshotId) {
    createOptions.body.volume['snapshot_id'] = options.snapshotId;
  }

  self.request(createOptions, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, new Volume(self, body.volume));
  });
};

exports.updateVolume = function (volume, callback) {
  var self = this,
      volumeId = volume instanceof Volume ? volume.id : volume;

  var updateOptions = {
    method: 'PUT',
    path: urlJoin(_urlPrefix, volumeId),
    body: {
      name: volume.name,
      description: volume.description
    }
  };

  self.request(updateOptions, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, new Volume(self, body.volume));
  });
};

exports.deleteVolume = function (volume, callback) {
  var volumeId = volume instanceof Volume ? volume.id : volume;

  return this.request({
    path: urlJoin(_urlPrefix, volumeId),
    method: 'DELETE'
  }, function (err) {
    return err
      ? callback(err)
      : callback(null, true);
  });
};