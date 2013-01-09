/*
 * flavors.js: Implementation of OpenStack Flavors Client.
 *
 * (C) 2013, Nodejitsu Inc.
 *
 */
 var pkgcloud = require('../../../../../lib/pkgcloud'),
    base     = require('../../../core/compute'),
    compute  = pkgcloud.providers.openstack.compute;


//
// ### function getFlavors (callback)
// #### @callback {function} f(err, flavors). `flavors` is an array that
// represents the flavors that are available to your account
//
// Lists all flavors available to your account.
//
exports.getFlavors = function getFlavors(callback) {
  var self = this;
  return this.request('flavors/detail', callback, function (body, res) {
    callback(null, body.flavors.map(function (result) {
      return new compute.Flavor(self, result);
    }), res);
  });
};

//
// ### function getFlavor (flavor, callback)
// #### @image    {Flavor|String} Flavor ID or an Flavor
// #### @callback {function} f(err, flavor). `flavor` is an object that
// represents the flavor that was retrieved.
//
// Gets a specified flavor of OpenStack Images using the provided details
// object.
//
exports.getFlavor = function getFlavor(flavor, callback) {
  var self     = this,
      flavorId = flavor instanceof base.Flavor ? flavor.id : flavor;
  return this.request('flavors/' + flavorId, callback, function (body, res) {
    callback(null, new compute.Flavor(self, body.flavor), res);
  });
};