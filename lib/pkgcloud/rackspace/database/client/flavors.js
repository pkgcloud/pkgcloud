/*
 * flavors.js: Implementation of Rackspace Flavors Client.
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */
var pkgcloud = require('../../../../../lib/pkgcloud'),
    Flavor   = pkgcloud.providers.rackspace.database.Flavor;


/**
 * client.getFlavors
 * @description Return an array of Flavor instances available
 * @memberof rackspace/database
 *
 * @param {Function}    callback ( error, flavors )
 */
exports.getFlavors = function getFlavors(callback) {
  var self = this;
  return this._request({
    path: 'flavors'
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body.flavors.map(function (result) {
          return new Flavor(self, result);
        }));
  });
};


/**
 * client.getFlavor
 * @description Gets a specified flavor
 * @memberof rackspace/database
 *
 * @param {object|String}       image   Either ID or instance of Flavor
 * @param {Function}            callback ( error, flavor )
 */
exports.getFlavor = function getFlavor(id, callback) {
  var self = this;
  return this._request({
    path: 'flavors/' + id
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, new Flavor(self, body.flavor));
  });
};
