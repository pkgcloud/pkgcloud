/*
 * share.js: OpenStack Manila access
 *
 * (C) 2016 Hans Cornelis
 *
 * MIT LICENSE
 *
 */

var util = require('util'),
    base = require('../../core/base/index'),
    _ = require('underscore');

var Access = exports.Access = function Access(client, details) {
    base.Model.call(this, client, details);
};

util.inherits(Access, base.Model);

Access.prototype._setProperties = function (details) {
    this.access_to = details.access_to;
    this.access_type = details.access_type;
    this.created_at = details.created_at;
    this.deleted = details.deleted;
    this.deleted_at = details.deleted_at;
    this.id = details.id;
    this.share_id = details.share_id;
    this.state = details.state;
    this.updated_at = details.updated_at;
}

Access.prototype.toJSON = function () {
    return _.pick(this, ['id', 'access_to', 'access_type', 'created_at', 'deleted', 'deleted_at',
        'share_id', 'state', 'updated_at']);
};


