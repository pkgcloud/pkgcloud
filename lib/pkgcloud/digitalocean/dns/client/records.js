/*
 * records.js: DigitalOcean DNS client records functionality
 *
 * (C) 2014 Maciej Małecki
 * MIT LICENSE
 *
 */

var base = require('../../../core/dns'),
    errs = require('errs'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    dns = pkgcloud.providers.digitalocean.dns;

exports.getRecords = function (zone, callback) {
  var self = this,
      id = zone instanceof base.Zone ? zone.id : zone;

  return self.request({
    path: '/domains/' + id + '/records',
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.records.map(function (record) {
        return new dns.Record(self, record);
      }));
  });
};

exports.getRecord = function (zone, record, callback) {
  var self = this,
      zoneId = zone instanceof base.Zone ? zone.id : zone,
      recordId = record instanceof base.Record ? record.id : record;

  return self.request({
    path: '/domains/' + zoneId + '/records/' + recordId
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, new dns.Record(self, body.record));
  });
};

exports.updateRecord = function (zone, record, callback) {
};

exports.updateRecords = function (zone, records, callback) {
};

exports.createRecord = function (zone, record, callback) {
};

exports.createRecords = function (zone, records, callback) {
};

exports.deleteRecord = function (zone, record, callback) {
};

exports.deleteRecords = function (zone, record, callback) {
};
