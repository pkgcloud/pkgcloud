/*
 * records.js: Rackspace DNS client records functionality
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var base = require('../../../core/dns'),
    urlJoin = require('url-join'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    errs = require('errs'),
    _ = require('underscore'),
    dns = pkgcloud.providers.rackspace.dns;

var _urlPrefix = 'domains',
    _recordFragment = 'records';

module.exports = {

  /**
   * client.getRecords
   * @function
   * @description Retrieve a list of all Records
 * @memberof rackspace/dns
   *
   * @param {Object|String}     zone        Either the ID or instance of Zone
   * @param {Function}          callback ( error, Records )
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

      else if (!body || !body.records) {
        return callback(new Error('Unexpected empty response'));
      }

      else{
        return callback(null, body.records.map(function (record) {
          return new dns.Record(self, record);
        }), res);
      }
    });
  },

  /**
   * client.getRecord
   * @function
   * @description get the details of dns record for the provided zone and record
 * @memberof rackspace/dns
   * @param {object|String}     zone          Either the ID or instance of Zone
   * @param {object|String}     record        The Record to query for
   * @param {Function}          callback ( error, Record )
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
   * client.updateRecord
   * @function
   * @description update a dns record for a given domain
 * @memberof rackspace/dns
   * @param {object|String}     zone            Either the ID or instance of Zone
   * @param {object[]}          record          The Record to update
   * @param {Function}          callback ( error, Record )
   */
  updateRecord: function (zone, record, callback) {
    this.updateRecords(zone, [ record ], callback);
  },

  /**
   * client.updateRecords
   * @function
   * @description update a set of dns records for a given domain
 * @memberof rackspace/dns
   * @param {object|String}     zone            Either the ID or instance of Zone
   * @param {object[]}          records         The Records to update
   * @param {Function}          callback ( error, Records )
   */
  updateRecords: function (zone, records, callback) {
    var self = this,
        data = [],
        zoneId = zone instanceof dns.Zone ? zone.id : zone;

    _.each(records, function (record) {
      if (!record.type || !record.name || !record.data) {
        return;
      }

      var updateRecord = {
        id: record.id,
        type: record.type,
        data: record.data,
        name: record.name
      };

      if (record.type === 'MX' || record.type === 'SRV') {
        updateRecord.priority = record.priority;
      }

      if (record.ttl) {
        updateRecord.ttl = record.ttl > 300 ? record.ttl : 300;
      }

      if (record.comment) {
        updateRecord.comment = record.comment;
      }

      data.push(updateRecord);
    });

    var requestOptions = {
      path: urlJoin(_urlPrefix, zoneId, _recordFragment),
      method: 'PUT',
      body: {
        records: data
      }
    };

    self._asyncRequest(requestOptions, function(err, result) {
      return err
        ? callback(err)
        : callback(null, result.response
          ? result.response.records.map(function (record) {
              return new dns.Record(self, record);
            })
          : []);
    });
  },

  /**
   * client.addRecord
   * @function
   * @description Create a DNS Record for a given Zone
 * @memberof rackspace/dns
   * @param {object|Number}     zone          Either the ID or instance of Zone
   * @param {object}            record        The Record to create
   * @param {Function}          callback ( error, Record )
   */
  createRecord: function (zone, record, callback) {
    this.createRecords(zone, [ record ], function(err, records) {
      return err
        ? callback(err)
        : callback(err, records[0]);
    });
  },

  /**
   * client.createRecords
   * @function
   * @description Create a set of DNS Records for a given Zone
 * @memberof rackspace/dns
   * @param {object|String}     zone          Either ID or instance of Zone
   * @param {object[]}          records       The array of Records to create
   * @param {Function}          callback ( error, Records )
   */
  createRecords: function (zone, records, callback) {
    var self = this,
        data = [],
        zoneId = zone instanceof dns.Zone ? zone.id : zone;

    _.each(records, function (record) {
      if (!record.type || !record.name || !record.data) {
        return;
      }

      var newRecord = {
        type: record.type,
        data: record.data,
        name: record.name
      };

      if (record.type === 'MX' || record.type === 'SRV') {
        newRecord.priority = record.priority;
      }

      if (record.ttl) {
        newRecord.ttl = record.ttl > 300 ? record.ttl : 300;
      }

      if (record.comment) {
        newRecord.comment = record.comment;
      }

      data.push(newRecord);
    });

    var requestOptions = {
      path: urlJoin(_urlPrefix, zoneId, _recordFragment),
      method: 'POST',
      body: {
        records: data
      }
    };

    self._asyncRequest(requestOptions, function (err, result) {
      return err
        ? callback(err)
        : callback(err, result.response.records.map(function (record) {
        return new dns.Record(self, record);
      }));
    });
  },

  /**
   * client.deleteRecord
   * @function
   * @description Delete a DNS Record for a given Zone
 * @memberof rackspace/dns
   * @param {object|String}     zone          Either ID or instance of Zone
   * @param {object|String}     record        The Record to query for
   * @param {Function}    callback ( error )
   */
  deleteRecord: function (zone, record, callback) {
    var self = this,
        zoneId = zone instanceof dns.Zone ? zone.id : zone,
        recordId = record instanceof dns.Record ? record.id : record;

    var requestOptions = {
      path: urlJoin(_urlPrefix, zoneId, _recordFragment, recordId),
      method: 'DELETE'
    };

    self._asyncRequest(requestOptions, function (err) {
      return callback(err);
    });
  },

  /**
   * client.deleteRecords
   * @function
   * @description Deletes multiple DNS Records for a given Zone
 * @memberof rackspace/dns
   * @param {object|String}     zone            Either ID or instance of Zone
   * @param {object[]}          records         The array of Records to delete
   * @param {Function}    callback ( error )
   */
  deleteRecords: function (zone, records, callback) {
    var self = this,
        zoneId = zone instanceof dns.Zone ? zone.id : zone;

    var ids = _.map(records, function(record) {
      return 'id=' +
        (record instanceof dns.Record
        ? record.id
        : record);
    });

    var requestOptions = {
      path: urlJoin(_urlPrefix, zoneId, _recordFragment + '?' + ids.join('&')),
      method: 'DELETE'
    };

    self._asyncRequest(requestOptions, function (err, result) {
      return callback(err);
    });
  }
};
