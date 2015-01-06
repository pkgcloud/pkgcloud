/*
 * services.js: Instance methods for working with services from Openstack CDN
 *
 * (C) 2014 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

var pkgcloud = require('../../../../../lib/pkgcloud'),
  errs = require('errs'),
  url = require('url'),
  urlJoin = require('url-join'),
  util = require('util'),
  _ = require('underscore'),
  cdn = pkgcloud.providers.openstack.cdn,
  jsonpatch = require('fast-json-patch');

// Declaring variables for helper functions defined later
var _getService, _validateProperties;

var _urlPrefix = '/services';

/**
 * client.getService
 *
 * @description Gets a service from the account
 *
 * @param {String|object}   service    The service or serviceId to fetch
 * @param {Function}        callback
 * @returns {request|*}
 */
exports.getService = function (service, callback) {
  return _getService(this, service, callback);
};

/**
 * client.getServices
 *
 * @description get the list of services for the current account
 *
 * @param {object|Function}   [options]     A set of options for the getServices call
 * @param {function}          callback      f(err, services) where services is an array of Service
 * @returns {*}
 */
exports.getServices = function getServices(options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var requestOptions = {
    path: _urlPrefix
  };

  requestOptions.qs = _.pick(options,
    'limit',
    'marker');

  return this._request(requestOptions, function (err, body) {
    if (err) {
      return callback(err);
    }

    callback(err, body.services.map(function(service) {
      return new cdn.Service(self, service);
    }));
  });
};

/**
 * client.createService
 *
 * @description Creates a service with the specified options.

 * @param {object}          details                                   the details to create this service
 * @param {String}          details.name                              the name of the new service
 * @param {Array}           details.domains                           list of domains for the new service
 * @param {Object}          details.domains[n]                        information about a domain
 * @param {String}          details.domains[n].domain                 the domain name
 * @param {String}          [details.domains[n].protocol]             the protocol used to access the domain; default = http
 * @param {Array}           details.origins                           list of origin servers for the new service
 * @param {Object}          details.origins[n]                        information about an origin server
 * @param {String}          details.origins[n].origin                 origin server address
 * @param {Number}          [details.origins[n].port]                 origin server port; default = 80
 * @param {Boolean}         [details.origins[n].ssl]                  whether origin server uses SSL; default = false
 * @param {Array}           [details.origins[n].rules]                list of rules defining the conditions when this origin should be accessed
 * @param {Object}          [details.origins[n].rules[n]]             information about an access rule
 * @param {String}          [details.origins[n].rules[n].name]        the name of the rule
 * @param {String}          [details.origins[n].rules[n].request_url] the request URL this rule should match (regex supported)
 * @param {Array}           [details.caching]                         list of TTL rules for assets of this service
 * @param {Object}          [details.caching[n]]                      information about a TTL rule
 * @param {String}          [details.caching[n].name]                 the name of the TTL rule
 * @param {Number}          [details.caching[n].ttl]                  the TTL value, in seconds?
 * @param {Array}           [details.caching[n].rules]                list of rules that determine if this TTL should be applied to an asset
 * @param {Object}          [details.caching[n].rules[n]]             information about a TTL rule
 * @param {String}          [details.caching[n].rules[n].name]        the name of the TTL rule 
 * @param {String}          [details.caching[n].rules[n].request_url] the request URL this rule should match (regex supported)
 * @param {Array}           [details.restrictions]                    list of restrictions on who can access new service
 * @param {Object}          [details.restrictions[n]]                 information about an access restriction
 * @param {String}          [details.restrictions[n].name]            the name of the restriction
 * @param {Array}           [details.restrictions[n].rules]           list of restrition rules
 * @param {Object}          [details.restrictions[n].rules[n]]        information about a restriction rule
 * @param {String}          [details.restrictions[n].rules[n].name]   the name of the restriction rule
 * @param {String}          [details.restrictions[n].rules[n].referrer] the domain from which the new service can be accessed
 * @param {String}          details.flavorId                          the ID of the flavor to use for this service
 * @param callback
 * @returns {request|null}
 */
exports.createService = function (details, callback) {
  if (typeof details === 'function') {
    callback = details;
    details = {};
  }

  details = details || {};

  if (!_validateProperties(['name', 'domains', 'origins', 'flavorId'], details,
    'options.%s is a required argument.', callback)) {
    return;
  }

  var self = this,
    createOptions = {
      method: 'POST',
      path: _urlPrefix,
      body: {
        name: details.name,
        domains: details.domains,
        origins: details.origins,
        flavor_id: details.flavorId
      }
    };

  if (details.caching) {
    createOptions.body.caching = details.caching;
  }

  if (details.restrictions) {
    createOptions.body.restrictions = details.restrictions;
  }

  return self._request(createOptions, function (err, body, res) {
    if (err) {
      return callback(err);
    }

    return _getService(self, res.headers.location, callback);
  });
};

/**
 * client.updateService
 *
 * @description Update a service
 *
 * @param {String|object}   service    The service or serviceId to update
 * @param {Function}        callback
 * @returns {request|*}
 */
exports.updateService = function (service, callback) {
  var self = this;

  if (!(service instanceof cdn.Service)) {
    return callback(new Error('you must provide a service to update'));
  }

  // Get a pristine copy of service resource from the server
  return _getService(self, service, function(err, pristineService) {
    if (err) {
      return callback(err);
    }

    // Compare passed-in service with pristine copy to generate
    // JSON Patch representation
    var patch = jsonpatch.compare(pristineService, service);
    return self._request({
      path: urlJoin(_urlPrefix, service.id),
      body: patch,
      method: 'PATCH'
    }, function (err) {
      if (err) {
        return callback(err);
      }

      callback(err, service);
    });
  });
};

/**
 * client.deleteService
 *
 * @description Delete a service from the account
 *
 * @param {String|object}   service    The service or serviceId to delete
 * @param {Function}        callback
 * @returns {request|*}
 */
exports.deleteService = function (service, callback) {
  var path = service instanceof cdn.Service
      ? urlJoin(_urlPrefix, service.id)
      : urlJoin(_urlPrefix, service);

  return this._request({
    path: path,
    method: 'DELETE'
  }, function (err) {
    return callback(err);
  });
};

/**
 * client.deleteServiceCachedAssets
 *
 * @description Delete cached assets of a service
 *
 * @param {String|object}   service    The service or serviceId whose cached assets to delete
 * @param {String|null}     assetUrl   The URL of the asset to delete; default = delete all assets
 * @param {Function}        callback
 * @returns {request|*}
 */
exports.deleteServiceCachedAssets = function (service, assetUrl, callback) {
  var path = service instanceof cdn.Service
      ? urlJoin(_urlPrefix, service.id)
      : urlJoin(_urlPrefix, service);

  if (!callback) {
    callback = assetUrl;
    assetUrl = null;
  }

  return this._request({
    path: urlJoin(path, 'assets'),
    qs: assetUrl ? { url: assetUrl } : { all: true },
    method: 'DELETE'
  }, function (err) {
    return callback(err);
  });
};

/**
 * _getService
 *
 * @description Gets a service from the account
 *
 * @param {String|object}   service    The service or serviceId or serviceUrl to fetch
 * @param {Function}        callback
 * @returns {request|*}
 */
_getService = function (self, service, callback) {
  var requestOptions = {};

  // Determine if service is an object, a URL or a string (serviceId)
  if (service instanceof cdn.Service) {
    requestOptions.path = urlJoin(_urlPrefix, service.id);
  } else {
    if (!!url.parse(service).protocol) {
      requestOptions.uri = service;
    } else {
      requestOptions.path = urlJoin(_urlPrefix, service);
    }
  }

  return self._request(requestOptions, function (err, body) {
    if (err) {
      return callback(err);
    }
    if (!body) {
      callback(new Error('Unexpected empty response'));
    }
    else {
      callback(err, new cdn.Service(self, body));
    }
  });
};

/**
 * _validateProperties
 *
 * @description local helper function for validating arguments
 *
 * @param {Array}       required      The list of required properties
 * @param {object}      options       The options object to validate
 * @param {String}      formatString  String formatter for the error message
 * @param {Function}    callback
 * @returns {boolean}
 */
_validateProperties = function (required, options, formatString, callback) {
  return !required.some(function (item) {
    if (typeof(options[item]) === 'undefined') {
      errs.handle(
        errs.create({ message: util.format(formatString, item) }),
        callback
      );
      return true;
    }
    return false;
  });
};
