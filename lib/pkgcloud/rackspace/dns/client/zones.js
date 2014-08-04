/*
 * zones.js: Rackspace DNS client zone functionality
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

var _urlPrefix = 'domains';

/**
 * @module dns
 */
module.exports = {

  /**
   * client.getZones
   * @function
   *
   * @description Retrieve a list of Zones
   *
   * @param {Object|Function}           details      
   * @param {}                          details.name    Name of Zones to find
   * @param {Function}                  callback ( error, Zones )
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

    requestOptions.qs = _.pick(details,
      'name');

    return self._request(requestOptions, function (err, body, res) {
      return err
        ? callback(err)
        : callback(null, body.domains.map(function (result) {
        return new dns.Zone(self, result);
      }), res);
    });
  },

  /**
   * client.getZone
   * @function
   *
   * @description Get the details for a specified Zone
   *
   * @param {String|object}       zone          The ID or instance of the Zone
   * @param {Function}            callback ( error, Zone )
   */
  getZone: function (zone, callback) {
    var self = this,
        zoneId = zone instanceof dns.Zone ? zone.id : zone;

    self._request({
      path: urlJoin(_urlPrefix, zoneId)
    }, function (err, body, res) {
      return err
        ? callback(err)
        : callback(null, new dns.Zone(self, body), res);
    });
  },

  /**
   * client.createZone
   * @function
   *
   * @description Register a new Zone in Rackspace Cloud DNS
   *
   * @param {object[]}          details       
   * @param {String}            details.name              Domain name for the Zone
   * @param {String}            details.email             Admin email address for the Zone
   * @param {Integer}           [details.ttl=300]         Default TTL for the Zone
   * @param {String}            [details.comment]         Comments for the Zone
   * @param {Function}          callback ( error , Zone )
   */
  createZone: function (details, callback) {
    this.createZones([ details ], function (err, zones) {
      if (err) {
        return callback(err);
      }

      if (zones && zones.length === 1) {
        return callback(err, zones[0]);
      }
      else {
        return callback(new Error('Unexpected error when creating single zone'), zones);
      }
    });
  },

  /**
   * client.createZones
   * @function
   *
   * @description Register Zones in the Rackspace Cloud DNS
   *
   * @param {object[]}          zones       
   * @param {String}            zones.name              Domain name for the Zone
   * @param {String}            zones.email             Admin email address for the Zone
   * @param {Integer}           [zones.ttl=300]         Default TTL for the Zone
   * @param {String}            [zones.comment]         Comments for the Zone
   * @param {Function}          callback ( error , Zones )
   */
  createZones: function (zones, callback) {
    var self = this;

    var listOfZones = [];
    _.each(zones, function (zone) {
      ['name', 'email'].forEach(function (required) {
        if (!zone[required]) throw new Error('details.' +
          required + ' is a required argument.');
      });

      var newZone = {
        name: zone.name,
        emailAddress: zone.email
      };

      if (zone.ttl && typeof(zone.ttl) === 'number' && zone.ttl >= 300) {
        newZone.ttl = zone.ttl;
      }

      if (zone.comment) {
        newZone.comment = zone.comment;
      }

      listOfZones.push(newZone);
    });

    var requestOptions = {
      path: _urlPrefix,
      method: 'POST',
      body: {
        domains: listOfZones
      }
    };

    self._asyncRequest(requestOptions, function (err, result) {
      return err
        ? callback(err)
        : callback(err, result.response.domains.map(function (domain) {
          return new dns.Zone(self, domain);
      }));
    });
  },


  /**
   * client.importZone
   * @function
   *
   * @description Provisions a new DNS zone under the account
   * specified by the BIND 9 formatted file configuration contents defined
   * in the request object.
   *
   * @param {Object}            details     
   * @param {String}            details.contentType     Must be 'BIND_9'
   * @param {String}            details.contents        BIND 9 formmatted configuration
   * @param {Function}          callback ( error, Zone )
   */
  importZone: function (details, callback) {
    var self = this;

    ['contentType', 'contents'].forEach(function (required) {
      if (!details[required]) throw new Error('details.' +
        required + ' is a required argument.');
    });

    if (details.contentType !== 'BIND_9') {
      callback(new Error({ invalidRequest: true }));
      return;
    }

    var importedZone = {
      contentType: details.contentType,
      contents: details.contents
    };

    var requestOptions = {
      path: urlJoin(_urlPrefix, 'import'),
      method: 'POST',
      body: {
        domains: [
          importedZone ]
      }
    };

    self._asyncRequest(requestOptions, function (err, result) {
      return err
        ? callback(err)
        : callback(err, result.response.domains.map(function (domain) {
        return new dns.Zone(self, domain);
      })[0]);
    });
  },

  /**
   * client.exportZone
   * @function
   *
   * @description Exports a provided domain as a BIND zone file
   *
   * @param {Object|String}     zone        The ID or instance of the Zone
   * @param {Function}          callback ( error, response )
   */
  exportZone: function (zone, callback) {
    var self = this,
      zoneId = zone instanceof dns.Zone ? zone.id : zone;

    var requestOptions = {
      path: urlJoin(_urlPrefix, zoneId, 'export'),
      method: 'GET'
    };

    self._asyncRequest(requestOptions, function (err, result) {
      return err
        ? callback(err)
        : callback(err, result.response);
    });
  },


  /**
   * client.updateZone
   * @function
   *
   * @description Update a Zone
   * @param {object}            zone     
   * @param {String}            zone.id                The ID of the Zone to update
   * @param {String}            zone.ttl               The new TTL
   * @param {String}            zone.emailAddres       The new admin email address
   * @param {String}            zone.comment           The new comment
   * @param {Function}          callback ( error )
   */
  updateZone: function (zone, callback) {
    this.updateZones([ zone ], callback);
  },

  /**
   * client.updateZones
   * @function
   *
   * @description Update and array of Zones
   * @param {object[]}          zones     
   * @param {String}            zone.id                The ID of the Zone to update
   * @param {String}            zone.ttl               The new TTL
   * @param {String}            zone.emailAddres       The new admin email address
   * @param {String}            zone.comment           The new comment
   * @param {Function}          callback ( error )
   */
  updateZones: function (zones, callback) {
    var self = this;

    var data = [];

    _.each(zones, function (zone) {
      if (!(zone instanceof dns.Zone)) {
        return;
      }

      var update = {
        id: zone.id,
        ttl: zone.ttl,
        emailAddress: zone.emailAddress,
        comment: zone.comment
      };

      data.push(update);
    });

    var requestOptions = {
      path: _urlPrefix,
      method: 'PUT',
      body: {
        domains: data
      }
    };

    self._asyncRequest(requestOptions, function(err) {
      callback(err);
    });
  },

  /**
   * @name Client.deleteZone
   * @description delete a zone
   * @param {Zone}              zone              the zone to delete
   * @param {object|Function}   options           options for the deleteZone call
   * @param {Function}          callback          handles the callback of your api call
   */
  deleteZone: function (zone, options, callback) {
    this.deleteZones([ zone ], options, callback);
  },

  /**
   * client.deleteZones
   * @function
   *
   * @description Delete an array of Zones
   * @param {object[]|String[]}         zone                            The ID or instance of the Zone
   * @param {object|Function}           options
   * @param {Function}                  callback ( error )
   */
  deleteZones: function (zones, options, callback) {
    var self = this;

    if (typeof(options) === 'function') {
      callback = options;
      options = {};
    }

    var zoneIds = [];

    _.each(zones, function (zone) {
      if (zone instanceof dns.Zone) {
        zoneIds.push(zone.id);
      }
      else {
        zoneIds.push(zone);
      }
    });

    var deleteSubzones = typeof options.deleteSubzones === 'boolean'
      ? options.deleteSubzones : true;

    // HACK: Can't use qs here as it puts array keys with index location
    // which breaks API parsing of supplied ids
    // https://github.com/visionmedia/node-querystring/issues/71

    var requestOptions = {
      path: _urlPrefix + '?' +
        zoneIds.map(function(z) { return 'id=' + z }).join('&') +
        '&deleteSubzones=' + deleteSubzones.toString(),
      method: 'DELETE'
    };

    self._asyncRequest(requestOptions, function(err) {
      return callback(err);
    });
  },

  /**
   * client.getZoneChanges
   * @function
   *
   * @description Get a list of changes for a provided Zone, optionally setting a date to filter by
   * @param {object|String}             zone            The ID or instance of the Zone
   * @param {object|Function}           options
   * @param {object}                    [options.since] The Date instance to filter by
   * @param {Function}                  callback ( error, body )
   */
  getZoneChanges: function (zone, options, callback) {
    var self = this,
        zoneId = zone instanceof dns.Zone ? zone.id : zone;

    if (typeof(options) === 'function') {
      callback = options;
      options = {};
    }
    var requestOptions = {
      path: urlJoin(_urlPrefix, zoneId, 'changes'),
      method: 'GET'
    };

    if (options.since) {
      requestOptions.qs = {
        since: options.since.toString()
      }
    }

    self._request(requestOptions, function (err, body, res) {
      return err
        ? callback(err)
        : callback(err, body);
    });
  },

  /**
   * client.cloneZone
   * @function
   * @description Clone a Zone from a provided Zone
   *
   * @param {Zone}                zone              The ID or instance of the Zone to clone
   *
   * @param {object|Function}     options
   *
   * @param {String}              options.cloneName                    The name of the new (cloned) Zone.
   *
   * @param {Boolean}             [options.cloneSubdomains=true]       Recursively clone
   * subdomains. If set to false, then only the top level domain and its records are
   * cloned. Cloned subdomain configurations are modified the same way that cloned
   * top level domain configurations are modified.
   *
   * @param {Boolean}             [options.modifyComment=true]         Replace occurrences
   * of the reference domain name with the new domain name in comments on the cloned
   * (new) domain. 
   *
   * @param {Boolean}             [options.modifyEmailAddress=true]    Replace occurrences
   * of the reference domain name with the new domain name in email addresses on the
   * cloned (new) domain. 
   *
   * @param {Boolean}             [options.modifyRecordData=true]    Replace occurrences
   * of the reference domain name with the new domain name in data fields (of records)
   * on the cloned (new) domain. Does not affect NS records.
   *
   * @param {Function}            callback          handles the callback of your api call
   */
  cloneZone: function (zone, options, callback) {
    var self = this,
        zoneId = zone instanceof dns.Zone ? zone.id : zone;

    if (typeof(options) === 'function') {
      callback = options;
      options = {};
    }

    var requestOptions = {
      path: urlJoin(_urlPrefix, zoneId, 'clone'),
      method: 'POST',
      qs: {
        cloneName: options.cloneName
      }
    };

    _.extend(requestOptions.qs, _.pick(options, ['cloneSubdomains', 'modifyComment',
    'modifyEmailAddress', 'modifyRecordData']));

    self._asyncRequest(requestOptions, function (err, result) {
      return err
        ? callback(err)
        : callback(err, result.response.domains.map(function (domain) {
        return new dns.Zone(self, domain);
      })[0]);
    });
  },

  /**
   * client.getSubZones
   * @function
   * @description Gets a list of the subzones for a provided Zone
   *
   * @param {object|String}     zone          The ID or instance of the Zone
   * @param {Function}          callback ( error, result )
   */
  getSubZones: function(zone, callback) {
    var self = this,
        zoneId = zone instanceof dns.Zone ? zone.id : zone;

    var requestOptions = {
      path: urlJoin(_urlPrefix, zoneId, 'subdomains'),
      method: 'GET'
    };

    self._request(requestOptions, function(err, body, res) {
      return err
        ? callback(err)
        : callback(null, body.domains.map(function (result) {
        return new dns.Zone(self, result);
      }), res);
    });
  }
};
