/*
 * record.js: DigitalOcean Cloud DNS Record
 *
 * (C) 2014 Maciej Małecki
 * MIT LICENSE
 *
 */

var util = require('utile'),
    base = require('../../core/dns/record');

var Record = exports.Record = function Record(zone, details) {
  base.Record.call(this, zone, details);
};
util.inherits(Record, base.Record);

Record.prototype._setProperties = function (details) {
  this.id = details.id;
  this.name = details.name;
  this.type = details.record_type;
  this.data = details.data;
};

Record.prototype.toJSON = function () {
  return {
    id: this.id,
    name: this.name,
    type: this.type,
    data: this.data
  };
};
