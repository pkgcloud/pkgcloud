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
    VolumeType = require('../volumetype').VolumeType;

var basePath = 'volumes';

exports.getVolumes = function (detailed, callback) {
  var self = this,
      path = basePath;

  if (typeof detailed === 'function') {
    callback = detailed;
  }
  else if (detailed) {
    path = basePath + '/details';
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
    path: basePath + '/' + volumeId
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
    path: basePath,
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
  var self = this;

  var updateOptions = {
    method: 'PUT',
    path: basePath + '/' + volume.id,
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
    path: basePath + '/' + volumeId,
    method: 'DELETE'
  }, function (err) {
    return err
      ? callback(err)
      : callback(null, true);
  });
};