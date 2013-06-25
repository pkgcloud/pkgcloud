/*
 * volume-attachments.js: OpenStack BlockStorage snapshot
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var Server = require('../../server').Server;

exports.getVolumeAttachments = function(server, callback) {
  var serverId = server instanceof Server ? server.id : server;

  return this.request({
    path: '/servers/' + serverId + '/os-volume_attachments'
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.volumeAttachments, res);
  });
};

exports.getVolumeAttachmentDetails = function (server, attachment, callback) {
  var serverId = server instanceof Server ? server.id : server,
      attachmentId = (typeof attachment === 'object') ? attachment.id : attachment;

  return this.request({
    path: '/servers/' + serverId + '/os-volume_attachments/' + attachmentId
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.volumeAttachment, res);
  });
};

exports.detachVolume = function(server, attachment, callback) {
  var serverId = server instanceof Server ? server.id : server,
      attachmentId = (typeof attachment === 'object') ? attachment.id : attachment;

  return this.request({
    path: '/servers/' + serverId + '/os-volume_attachments/' + attachmentId,
    method: 'DELETE'
  }, function (err) {
    return err
      ? callback(err)
      : callback(null, true);
  });
};

exports.attachVolume = function (server, volume, callback) {
  var serverId = server instanceof Server ? server.id : server,
      volumeId = (typeof volume === 'object') ? volume.id : volume;

  return this.request({
    path: '/servers/' + serverId + '/os-volume_attachments',
    body: {
      volumeAttachment: {
        device: null,
        volumeId: volumeId
      }
    },
    method: 'POST'
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body.volumeAttachment);
  });
};