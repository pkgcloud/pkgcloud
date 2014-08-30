/*
 * zone.js: dnsimple DNS Zone
 *
 * Tom Gallacher
 */

var util = require('util'),
    base = require('../../core/dns/zone'),
    _ = require('underscore');

var Zones = exports.Zones = function Zone(client, details) {
  base.Zone.call(this, client, details);
};

util.inherits(Zones, base.Zone);

Zones.prototype._setProperties = function (details) {
  var self = this;
  details = details.domain;

  self.id = details.id;
  self.name = details.name;
  self.accountId = details.user_id;
  self.ttl = details.ttl;
  self.emailAddress = details.emailAddress;
  self.updated = new Date(details.updated_at);
  self.created = new Date(details.created_at);
  self.nameservers = details.nameservers || [];

};

Zones.prototype.toJSON = function () {
  return _.pick(this, ['id', 'name', 'description', 'ttl', 'accountId',
    'nameservers', 'emailAddress', 'created', 'updated']);
};
