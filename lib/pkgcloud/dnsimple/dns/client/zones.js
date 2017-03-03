/*
 * zones.js: dnsimple client zone
 *
 * Tom Gallacher
 */

var base = require('../../../core/dns'),
    urlJoin = require('url-join'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    errs = require('errs'),
    _ = require('underscore'),
    dns = pkgcloud.providers.dnsimple.dns;

var _urlPrefix = 'domains';

module.exports = {

  /**
   * @name Client.getZones
   *
   * @description getZones retrieves your list of zones
   *
   * @param {Object|Function}     details     provides filters on your zones request
   * @param {Function}            callback    handles the callback of your api call
   */
  getZones: function (details, callback) {
    var self = this;

    if (typeof(details) === 'function') {
      callback = details;
      details = {};
    }

    var requestOptions = {
      path: _urlPrefix
    };

    return self._request(requestOptions, function (err, body, res) {
      return err
        ? callback(err)
        : callback(null, body.map(function (result) {
        return new dns.Zones(self, result);
      }), res);
    });
  },

  /**
   * @name Client.getZone
   *
   * @description Gets the details for a specified zone id / name
   *
   * @param {String|object}       zone          the zone id / name of the requested zone
   * @param {Function}            callback      handles the callback of your api call
   */
  getZone: function (zone, callback) {
    var self = this,
        zoneId = zone instanceof dns.Zone ? zone.id : zone;

    self._request({
      path: urlJoin(_urlPrefix, zoneId, 'zone'),
      headers: { 'Accept': 'text/plain' }
    }, function (err, body, res) {
      return err
        ? callback(err)
        : callback(null, new dns.Zone(self, body), res);
    });
  },

  /**
   * @name Client.createZone
   *
   * @description register a new zone in the dnsimple cloud dns
   *
   * @param {Object}     details     the information for your new zone
   * @param {Function}   callback    handles the callback of your api call
   */
  createZone: function (details, callback) {
  },

  /**
   * @name Client.createZones
   *
   * @description register a new zone in the dnsimple cloud dns
   *
   * @param {Array}      zones      the array of zones to create
   * @param {Function}   callback    handles the callback of your api call
   */
  createZones: function (zones, callback) {
  },


  /**
   * @name Client.importZone
   *
   * @description This call provisions a new DNS zone under the account
   * specified by the BIND 9 formatted file configuration contents defined
   * in the request object.
   *
   * @param {Object}     details     the information for your new zone
   * @param {Function}   callback    handles the callback of your api call
   */
  importZone: function (details, callback) {
  },

  /**
   * @name Client.exportZone
   *
   * @description This call exports a provided domain as a BIND zone file
   *
   * @param {Object|String}     zone        the information for your new zone
   * @param {Function}          callback    handles the callback of your api call
   */
  exportZone: function (zone, callback) {
  },


  /**
   * @name Client.updateZone
   * @description update a zone
   * @param {Zone}      zone      the zone to update
   * @param {Function}    callback    handles the callback of your api call
   */
  updateZone: function (zone, callback) {
    this.updateZones([ zone ], callback);
  },

  /**
   * @name Client.updateZones
   * @description update an array of zones
   * @param {Array}       zones     the array of zones to update
   * @param {Function}    callback    handles the callback of your api call
   */
  updateZones: function (zones, callback) {
  },

  /**
   * @name Client.deleteZone
   * @description delete a zone
   * @param {Zone}              zone              the zone to delete
   * @param {object|Function}   options           options for the deleteZone call
   * @param {Function}          callback          handles the callback of your api call
   */
  deleteZone: function (zone, options, callback) {
  },

  /**
   * @name Client.deleteZones
   * @description delete an array of zones
   * @param {Array}               zones             the array of zones or zoneIds to delete
   * @param {object|Function}     options           options for the deleteZones call
   * @param {Function}            callback          handles the callback of your api call
   */
  deleteZones: function (zones, options, callback) {
  },

  /**
   * @name Client.getZoneChanges
   * @description get a list of changes for a provided zone, optionally setting a date to filter by
   * @param {Zone}                zone              the zone or zoneId for the changes
   * @param {object|Function}     options           options for call
   * @param {Date}                [options.since]   changes after given date
   * @param {Function}            callback          handles the callback of your api call
   */
  getZoneChanges: function (zone, options, callback) {
  },

  /**
   * @name Client.cloneZone
   * @description clone a zone from a provided domain name
   *
   * @param {Zone}                zone              the zone or zoneId for the changes
   *
   * @param {object|Function}     options           options for call
   *
   * @param {String}              [options.cloneName]   The name of the new (cloned) domain.
   *
   * @param {Boolean}             [options.cloneSubdomains]       Recursively clone
   * subdomains. If set to false, then only the top level domain and its records are
   * cloned. Cloned subdomain configurations are modified the same way that cloned
   * top level domain configurations are modified. (Default=true)
   *
   * @param {Boolean}             [options.modifyComment]         Replace occurrences
   * of the reference domain name with the new domain name in comments on the cloned
   * (new) domain. (Default=true)
   *
   * @param {Boolean}             [options.modifyEmailAddress]    Replace occurrences
   * of the reference domain name with the new domain name in email addresses on the
   * cloned (new) domain. (Default=true)
   *
   * @param {Boolean}             [options.modifyRecordData]    Replace occurrences
   * of the reference domain name with the new domain name in data fields (of records)
   * on the cloned (new) domain. Does not affect NS records. (Default=true)
   *
   * @param {Function}            callback          handles the callback of your api call
   */
  cloneZone: function (zone, options, callback) {
  },

  /**
   * @name Client.getSubZones
   * @description gets a list of the subzones for a provided zone
   *
   * @param {object|Number}     zone          the zone of the record to query for
   * @param {Function}          callback      handles the callback of your api call
   */
  getSubZones: function(zone, callback) {
  }
};
