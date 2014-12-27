/*
 * flavors.js: Instance methods for working with flavors from Openstack CDN
 *
 * (C) 2014 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

var pkgcloud = require('../../../../../lib/pkgcloud'),
  errs = require('errs'),
  urlJoin = require('url-join'),
  util = require('util'),
  cdn = pkgcloud.providers.openstack.cdn;

var _urlPrefix = '/flavors';

/**
 * validateProperties
 *
 * @description local helper function for validating arguments
 *
 * @param {Array}       required      The list of required properties
 * @param {object}      options       The options object to validate
 * @param {String}      formatString  String formatter for the error message
 * @param {Function}    callback
 * @returns {boolean}
 */
function validateProperties(required, options, formatString, callback) {
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
}

/**
 * client.getFlavor
 *
 * @description Gets a flavor from the account
 *
 * @param {String|object}   flavor    The flavor or flavorId to fetch
 * @param {Function}        callback
 * @returns {request|*}
 */
exports.getFlavor = function (flavor, callback) {
  var self = this,
    path = flavor instanceof cdn.Flavor
      ? urlJoin(_urlPrefix, flavor.id)
      : urlJoin(_urlPrefix, flavor);

  return this._request({
    path: path
  }, function (err, body) {
    if (err) {
      return callback(err);
    }
    if (!body) {
      return new Error('Unexpected empty response');
    }
    else {
      callback(null, new cdn.Flavor(self, body));
    }
  });
};

/**
 * client.getFlavors
 *
 * @description get the list of flavors for the current account
 *
 * @param {object|Function}   [options]     A set of options for the getFlavors call
 * @param {function}          callback      f(err, flavors) where flavors is an array of Flavor
 * @returns {*}
 */
exports.getFlavors = function getFlavors(options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var requestOptions = {
    path: _urlPrefix
  };

  return this._request(requestOptions, function (err, body) {
    if (err) {
      callback(err);
      return;
    }

    callback(err, body.flavors.map(function(flavor) {
      return new cdn.Flavor(self, flavor);
    }));
  });
};

/**
 * client.createFlavor
 *
 * @description Creates a flavor with the specified options.

 * @param {object}          details                                   the details to create this flavor
 * @param {String}          details.id                                the id of the new flavor
 * @param {Array}           details.providers                         list of providers for the new flavor
 * @param {Object}          details.providers[n]                      information about a provider
 * @param {String}          details.providers[n].provider             the provider's name
 * @param {Array}           details.providers[n].links                list of links for the provider
 * @param {Object}          details.providers[n].links[n]             information about a provider's link
 * @param {String}          details.providers[n].links[n].href        the URL of the link
 * @param {String}          details.providers[n].links[n].rel         the relationship of the link
 * @param callback
 * @returns {request|null}
 */
exports.createFlavor = function (details, callback) {
  if (typeof details === 'function') {
    callback = details;
    details = {};
  }

  details = details || {};

  if (!validateProperties(['id', 'providers'], details,
    'options.%s is a required argument.', callback)) {
    return;
  }

  var self = this,
    createOptions = {
      method: 'POST',
      path: _urlPrefix,
      body: {
        id: details.id,
        providers: details.providers
      }
    };

  return self._request(createOptions, function (err) {
    if (err) {
      return callback(err);
    }

    return self.getFlavor(details.id, callback);
  });
};

/**
 * client.deleteFlavor
 *
 * @description Delete a flavor from the account
 *
 * @param {String|object}   flavor    The flavor or flavorId to delete
 * @param {Function}        callback
 * @returns {request|*}
 */
exports.deleteFlavor = function (flavor, callback) {
  var path = flavor instanceof cdn.Flavor
      ? urlJoin(_urlPrefix, flavor.id)
      : urlJoin(_urlPrefix, flavor);

  return this._request({
    path: path,
    method: 'DELETE'
  }, function (err) {
    if (err) {
      return callback(err);
    }

    callback(err, true);
  });
};
