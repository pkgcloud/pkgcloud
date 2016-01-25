/*
 * volume.js: OpenStack Block Storage volume
 *
 * (C) 2014 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var util = require('util'),
    base = require('../../core/base'),
    _ = require('underscore');

var Volume = exports.Volume = function Volume(client, details) {
  base.Model.call(this, client, details);
};

util.inherits(Volume, base.Model);

Volume.prototype._setProperties = function (details) {
  this.id = details.id;
  this.status = details.status;
  this.name = details.name || details['display_name'];
  this.description = details.description || details['display_description'];
  this.createdAt = details['created_at'];
  this.size = details.size;
  this.volumeType = details.volumeType || details['volume_type'];
  this.attachments = details.attachments;
  this.snapshotId = details.snapshotId || details['snapshot_id'];
};

Volume.prototype.toJSON = function () {
  return _.pick(this, ['id', 'status', 'name', 'description', 'createdAt',
    'size', 'volumeType', 'attachments', 'snapshotId']);
};


