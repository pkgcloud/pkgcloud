/*
 * zone.js: DigitalOcean DNS Zone
 *
 * (C) 2014 Maciej Małecki
 * MIT LICENSE
 *
 */

var util = require('util'),
    base = require('../../core/dns/zone');

var Zone = exports.Zone = function Zone(client, details) {
  base.Zone.call(this, client, details);
};
util.inherits(Zone, base.Zone);

Zone.prototype._setProperties = function (details) {
  this.id = details.id;
  this.name = details.name;
  this.ttl = details.ttl;
};

Zone.prototype.toJSON = function () {
  return {
    id: this.id,
    name: this.name,
    ttl: this.ttl
  };
};
