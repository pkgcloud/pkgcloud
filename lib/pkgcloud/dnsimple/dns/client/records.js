/*
 * records.js: dnsimple client records
 *
 * Tom Gallacher
 */

var base = require('../../../core/dns'),
    urlJoin = require('url-join'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    errs = require('errs'),
    _ = require('underscore'),
    dns = pkgcloud.providers.dnsimple.dns;

var _urlPrefix = 'domains',
    _recordFragment = 'records';

module.exports = {

  /**
   * @name Client.getRecords
   * @description getRecords retrieves your list of records for this domain
   * @param {Object|Number}     zone        the zone for the getRecords query
   * @param {Function}          callback    handles the callback of your api call
   */
  getRecords: function (zone, callback) {
    var self = this,
        zoneId = zone instanceof dns.Zone ? zone.id : zone;

    var requestOptions = {
      path: urlJoin(_urlPrefix, zoneId, _recordFragment)
    };

    self._request(requestOptions, function (err, body, res) {
      if(err) {
        return callback(err);
      }

      else if (!body) {
        return callback(new Error('Unexpected empty response'));
      }

      else{
        return callback(null, body.map(function (record) {
          return new dns.Record(self, record);
        }), res);
      }
    });
  },

  /**
   * @name Client.getRecord
   * @description get the details of dns record for the provided zone and record
   * @param {object|Number}     zone          the zone of the record to query for
   * @param {object|String}     record        the record to query for
   * @param {Function}          callback      handles the callback of your api call
   */
  getRecord: function (zone, record, callback) {
    var self = this,
        zoneId = zone instanceof dns.Zone ? zone.id : zone,
        recordId = record instanceof dns.Record ? record.id : record;

    var requestOptions = {
      path: urlJoin(_urlPrefix, zoneId, _recordFragment, recordId)
    };

    self._request(requestOptions, function (err, body, res) {
      return err
        ? callback(err)
        : callback(err, new dns.Record(self, body));
    });
  },

  /**
   * @name Client.updateRecord
   * @description update a dns record for a given domain
   * @param {Record}      record      the record to update
   * @param {Function}    callback    handles the callback of your api call
   */
  updateRecord: function (zone, record, callback) {
    var self = this,
        data = [],
        zoneId = zone instanceof dns.Zone ? zone.id : zone;

    if (!record.type || !record.name || !record.data) {
      return callback(new Error('request must have type / name / data'));
    }

    var updateRecord = {
      type: record.type,
      content: record.data,
      name: record.name
    };

    if (record.type === 'MX' || record.type === 'SRV') {
      updateRecord.prio = record.priority;
    }

    if (record.ttl) {
      updateRecord.ttl = record.ttl > 300 ? record.ttl : 300;
    }

    if (record.comment) {
      updateRecord.comment = record.comment;
    }

    data = updateRecord;

    var requestOptions = {
      path: urlJoin(_urlPrefix, zoneId, _recordFragment, record.id),
      method: 'PUT',
      body: {
        record: data
      }
    };

    self._request(requestOptions, function(err, result) {
      return err
        ? callback(err)
        : callback(null, new dns.Record(self, result));
    });
  },

  /**
   * @name Client.updateRecords
   * @description update a set of dns records for a given domain
   * @param {Array}       records     the records to update
   * @param {Function}    callback    handles the callback of your api call
   */
  updateRecords: function (zone, records, callback) {
    return callback(new Error('Not Implemented'));
  },

  /**
   * @name Client.addRecord
   * @description create a dns record for a given zone
   * @param {object|Number}     zone          the zone to add the record to
   * @param {object}            record        the record to create
   * @param {Function}          callback      handles the callback of your api call
   */
  createRecord: function (zone, record, callback) {
    var self = this,
        data,
        zoneId = zone instanceof dns.Zone ? zone.id : zone;

    if (!record.type || !record.name || !record.data) {
      return callback(new Error('request must have type / name / data'));
    }

    var newRecord = {
      record_type: record.type,
      content: record.data,
      name: record.name
    };

    if (record.type === 'MX' || record.type === 'SRV') {
      newRecord.prio = record.priority;
    }

    if (record.ttl) {
      newRecord.ttl = record.ttl > 300 ? record.ttl : 300;
    }

    if (record.comment) {
      newRecord.comment = record.comment;
    }

    data = newRecord;

    var requestOptions = {
      path: urlJoin(_urlPrefix, zoneId, _recordFragment),
      method: 'POST',
      body: {
        record: data
      }
    };

    self._request(requestOptions, function (err, result) {
      return err
        ? callback(err)
        : result.errors || result.warning
          ? callback(new Error(result.errors.length > 0
            ? result.errors
            : result.warning))
          : callback(null, new dns.Record(self, result));
    });
  },

  /**
   * @name Client.createRecords
   * @description create a set of dns records for a given zone
   * @param {object|Number}     zone          the zone to add the records to
   * @param {Array}             records       the array of records to create
   * @param {Function}          callback      handles the callback of your api call
   */
  createRecords: function (zone, records, callback) {
    return callback(new Error('Not Implemented'));
  },

  /**
   * @name Client.deleteRecord
   * @description delete a dns record for a given domain
   * @param {object|Number}     zone          the zone of the record to query for
   * @param {object|Number}     record        the record id to delete
   * @param {Function}    callback    handles the callback of your api call
   */
  deleteRecord: function (zone, record, callback) {
    var self = this,
        zoneId = zone instanceof dns.Zone ? zone.id : zone,
        recordId = record instanceof dns.Record ? record.id : record;

    var requestOptions = {
      path: urlJoin(_urlPrefix, zoneId, _recordFragment, recordId),
      method: 'DELETE'
    };

    self._request(requestOptions, function (err) {
      return callback(err);
    });
  },

  /**
   * @name Client.deleteRecords
   * @description deletes multiple dns records for a given domain
   * @param {object|Number}     zone          the zone of the record to query for
   * @param {Array}       records     the array of ids to delete
   * @param {Function}    callback    handles the callback of your api call
   */
  deleteRecords: function (zone, records, callback) {
    return callback(new Error('Not Implemented'));
  }
};
