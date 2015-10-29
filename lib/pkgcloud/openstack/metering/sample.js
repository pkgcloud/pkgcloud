/*
 * sample.js: OpenStack Ceilometer samples
 *
 * (C) 2015 Hans Cornelis
 *
 * MIT LICENSE
 *
 */

var util = require('util'),
    base = require('../../core/base/index'),
    _ = require('underscore');

var Sample = exports.Sample = function Sample(client, details) {
    base.Model.call(this, client, details);
};

util.inherits(Sample, base.Model);

Sample.prototype._setProperties = function (details) {
    this.id = details.id;
    this.metadata = details.metadata;
    this.meter = details.meter;
    this.project_id = details.project_id;
    this.recorded_at = details.recorded_at;
    this.resource_id = details.resource_id;
    this.source = details.source;
    this.timestamp = details.timestamp;
    this.type = details.type;
    this.unit = details.unit;
    this.user_id = details.user_id;
    this.volume = details.volume;
};

Sample.prototype.toJSON = function () {
    return _.pick(this, ['id', 'metadata', 'meter', 'project_id', 'recorded_at', 'resource_id', 'source', 'timestamp', 'type', 'unit', 'user_id', 'volume']);
};


