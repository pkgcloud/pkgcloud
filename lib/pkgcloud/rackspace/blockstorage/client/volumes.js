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

/**
 * client.getVolumes
 *
 * @description Get the volumes for an account
 * @memberof rackspace/blockstorage
 *
 * @param {boolean}     [options=false]        Get the full details for the volumes
 * @param {function}    callback ( error, volumes )
 */
exports.getVolumes = function (options, callback) {
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
      : callback(null, body.volumes.map(function (data) {
      return new Volume(self, data);
    }), res);
  });
};

/**
 * client.getVolume
 *
 * @description Get the details for a specific Volume
 * @memberof rackspace/blockstorage
 *
 * @param {object|String}   volume      The ID or instance of the Volume
 * @param {function}        callback ( error, volume )
 */
exports.getVolume = function (volume, callback) {
  var self = this,
    volumeId = volume instanceof Volume ? volume.id : volume;

  return self._request({
    path: urlJoin(_urlPrefix, volumeId)
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, new Volume(self, body.volume));
  });
};

/**
 * client.createVolume
 *
 * @description Creates a Volume from the provided options
 * @memberof rackspace/blockstorage
 *
 * @param {object}              options
 * @param {String}              options.name            The name of the new Volume
 * @param {String}              options.description     The description for the new Volume
 * @param {Integer}             options.size            The size of the new Volume in GB
 * @param {String}              [options.snapshotId]    The snapshotId to use in creating the new Volume
 * @param {object|String}       [options.volumeType]    The name or instance of the volumeType for the new Volume
 * @param {Function}            callback ( error, volume )
 */
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

  self._request(createOptions, function (err, body) {
    return err
      ? callback(err)
      : callback(null, new Volume(self, body.volume));
  });
};

/**
 * client.updateVolume
 *
 * @description Update a Volume from a current instance
 * @memberof rackspace/blockstorage
 *
 * @param {object}              volume
 * @param {String}              volume.id               The ID of the Volume to update
 * @param {String}              volume.name             The name of the updated Volume
 * @param {String}              volume.description      The description for the updated Volume
 * @param {Function}            callback ( error, volume )
 */
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

  self._request(updateOptions, function (err, body) {
    return err
      ? callback(err)
      : callback(null, new Volume(self, body.volume));
  });
};

/**
 * client.deleteVolume
 *
 * @description Delete a Volume
 * @memberof rackspace/blockstorage
 *
 * @param {object|String}       volume          The ID or instance of the Volume
 * @param {function}            callback ( error )
 */
exports.deleteVolume = function (volume, callback) {
  var volumeId = volume instanceof Volume ? volume.id : volume;

  return this._request({
    path: urlJoin(_urlPrefix, volumeId),
    method: 'DELETE'
  }, function (err) {
    return err
      ? callback(err)
      : callback();
  });
};
