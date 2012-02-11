/*
 * flavors.js: Implementation of Joyent Flavors Client.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */
var pkgcloud = require('../../../../../lib/pkgcloud'),
    base     = require('../../../core/compute'),
    compute  = pkgcloud.providers.joyent.compute;

// ### function getFlavors (callback) 
//
// Lists all flavors available to your account.
//
// #### @callback {function} f(err, flavors). `flavors` is an array that
// represents the flavors that are available to your account
//
exports.getFlavors = function getFlavors(callback) {
  var self = this;
  this.request(this.config.account + '/packages', callback, function (body) {
    callback(null, body.map(function (result) {
      return new compute.Flavor(self, result);
    }));
  });
};

// ### function getFlavor (flavor, callback) 
//
// Gets a specified flavor of Joyent DataSets using the provided details
// object.
//
// #### @image    {Flavor|String} Flavor ID or an Flavor
// #### @callback {function} f(err, flavor). `flavor` is an object that
// represents the flavor that was retrieved.
//
exports.getFlavor = function getFlavor(flavor, callback) {
  var self       = this,
      flavorId   = flavor instanceof base.Flavor ? flavor.id : flavor;

  // joyent decided to add spaces to their identifiers
  flavorId = encodeURIComponent(flavorId);

  this.request(this.config.account + '/packages/' + flavorId, callback,
    function (body) { callback(null, new compute.Flavor(self,body));
  });
};