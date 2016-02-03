/*
 * share.js: OpenStack Manila shares
 *
 * (C) 2015 Hans Cornelis
 *
 * MIT LICENSE
 *
 */

var util = require('util'),
    base = require('../../core/base/index'),
    _ = require('underscore');

var Share = exports.Share = function Share(client, details) {
    base.Model.call(this, client, details);
};

util.inherits(Share, base.Model);

Share.prototype._setProperties = function (details) {
    this.id = details.id;
    this.links = details.links;
    this.name = details.name;
    this.status = details.status;
    this.export_location = details.export_location;
    this.availability_zone = details.availability_zone;
    this.created_at = details.created_at;
    this.description = details.description;
    this.share_proto = details.share_proto;
    this.share_network_id = details.share_network_id;
    this.host = details.host;
    this.volume_type = details.volume_type;
    this.snapshot_id = details.snapshot_id;
    this.size = details.size;
};

Share.prototype.toJSON = function () {
    return _.pick(this, ['id', 'links', 'name', 'status', 'export_location', 'availability_zone',
        'created_at', 'description', 'share_proto', 'share_network_id', 'host',
        'volume_type', 'snapshot_id', 'size']);
};


