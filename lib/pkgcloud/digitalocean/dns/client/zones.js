/*
 * zones.js: DigitalOcean DNS client zone functionality
 *
 * (C) 2014 Maciej Małecki
 * MIT LICENSE
 *
 */

var base = require('../../../core/dns'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    errs = require('errs'),
    dns = pkgcloud.providers.digitalocean.dns;

exports.getZones = function (callback) {
  var self = this;
  return self.request({
    path: '/domains'
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.domains.map(function (domain) {
        return new dns.Zone(self, domain);
      }));
  });
};

exports.getZone = function (zone, callback) {
  var id = zone instanceof dns.Zone ? zone.id : zone;
  return this.request({
    path: '/domains/' + id
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, new dns.Zone(self, body.domain));
  });
};

exports.createZone = function (options, callback) {
};

exports.exportZone = function (zone, callback) {
};

exports.updateZone = function (zone, callback) {
};

exports.deleteZone = function (zone, options, callback) {
};
