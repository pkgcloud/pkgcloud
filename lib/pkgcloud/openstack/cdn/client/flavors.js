/*
 * flavors.js: Instance methods for working with flavors from Openstack CDN
 *
 * (C) 2014 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

var pkgcloud = require('../../../../../lib/pkgcloud'),
  urlJoin = require('url-join'),
  cdn = pkgcloud.providers.openstack.cdn;

var _urlPrefix = '/flavors';

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
      callback(new Error('Unexpected empty response'));
    }
    else {
      callback(err, new cdn.Flavor(self, body));
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
      return callback(err);
    }

    callback(err, body.flavors.map(function(flavor) {
      return new cdn.Flavor(self, flavor);
    }));
  });
};
