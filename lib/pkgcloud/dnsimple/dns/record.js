/*
 * record.js: dnsimple Record
 *
 * Tom Gallacher
 */

var util = require('util'),
    base = require('../../core/dns/record'),
    _ = require('underscore');

var Record = exports.Record = function Record(zone, details) {
  base.Record.call(this, zone, details);
};

util.inherits(Record, base.Record);

Record.prototype._setProperties = function (details) {
  var self = this;
  var record = details.record;

  self.id = record.id;
  self.name = record.name;
  self.type = record.record_type;
  self.data = record.content;
  self.ttl = record.ttl;
  self.updated = new Date(record.updated_at);
  self.created = new Date(record.created_at);
};

Record.prototype.toJSON = function () {
  return _.pick(this, ['id', 'name', 'type', 'ttl', 'data',
    'created', 'updated']);
};
