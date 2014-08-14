/*
 * volumetypes.js: Instance methods for working with VolumeTypes from CloudBlockStorage
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 *
 */
var errs = require('errs'),
    VolumeType = require('../volumetype').VolumeType,
    urlJoin = require('url-join');

var _urlPrefix = 'types';

/**
 * client.getVolumeTypes
 *
 * @description Get the Volume Types for an account
 * @memberof rackspace/blockstorage
 *
 * @param {Function}        callback ( error, volumeTypes )
 */
exports.getVolumeTypes = function(callback) {
  var self = this;
  return this._request({
    path: _urlPrefix
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body['volume_types'].map(function (data) {
      return new VolumeType(self, data);
    }), res);
  });
};

/**
 * client.getVolumeType
 *
 * @description Get the details for the provided Volume Type
 * @memberof rackspace/blockstorage
 *
 * @param {object|String}   volumeType          The ID or instance of the volumeType
 * @param {Function}        callback ( error, volumeType )
 */
exports.getVolumeType = function (volumeType, callback) {
  var volumeTypeId = volumeType instanceof VolumeType ? volumeType.id : volumeType;

  var self = this;
  return this._request({
    path: urlJoin(_urlPrefix, volumeTypeId)
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, new VolumeType(self, body['volume_type']));
  });
};
