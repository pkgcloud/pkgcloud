/*
 * zone.js: dnsimple DNS Zone
 *
 * Tom Gallacher
 */

var util = require('util'),
    base = require('../../core/dns/zone'),
    _ = require('underscore');

var Zone = exports.Zone = function Zone(client, details) {
  base.Zone.call(this, client, details);
};

util.inherits(Zone, base.Zone);

Zone.prototype._setProperties = function (details) {
  var self = this;
  var zone = details.split('\n');

  details = {};
  details.nameservers = [];

  zone.forEach(function (line) {
    var ttl = line.match(/^\$TTL?\s+(.*)$/);
    if (ttl !== null) {
      details.ttl = ttl[1];
      return true;
    }

    var origin = line.match(/^\$ORIGIN?\s+(.*)$/);
    if (origin !== null) {
      details.name = origin[1].slice(0, -1);
      return true;
    }

    var nameserver = line.match(/\s+NS (.*)$/);
    if (nameserver !== null) {
      details.nameservers.push(nameserver[1].slice(0, -1));
      return true;
    }
  });

  self.id = details.id || details.name;
  self.name = details.name;
  self.accountId = undefined;
  self.ttl = details.ttl;
  self.emailAddress = undefined;
  self.updated = undefined;
  self.created = undefined;
  self.nameservers = details.nameservers || [];

};

Zone.prototype.toJSON = function () {
  return _.pick(this, ['id', 'name', 'description', 'ttl', 'accountId',
    'nameservers', 'emailAddress', 'created', 'updated']);
};
