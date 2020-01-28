/**
 * Created by Ali Bazlamit on 8/19/2017.
 */

var pkgcloud = require('../../../../../lib/pkgcloud'),
  base = require('../../../core/compute'),
  oneandone = require('liboneandone-2'),
  compute = pkgcloud.providers.oneandone.compute;

//
// ### function getFlavors(size, callback)
// #### @size    {size|String} flavor name or part of it S,M,L,XL
// #### @callback {function} f(err, flavors). `flavors`
//
// Returns available flavours for fixed servers.
//
exports.getFlavors = function getFlavors(callback) {
  var self = this;

  oneandone.listHardwareFlavours(function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 200) {
      callback(JSON.parse(body));
      return;
    }
    var flavors = JSON.parse(body);
    callback(error, flavors.map(function (flavor) {
      return new compute.Flavor(self, flavor);
    }));
  });
};

//
// ### function getFlavor (flavor, callback)
// #### @flavor    {Flavor|String} Flavor ID or an Flavor
// #### @callback {function} f(err, flavor). `flavor` is an object that
// represents the flavor that was retrieved.
//
// Returns information about one flavour
//
exports.getFlavor = function getFlavor(flavor, callback) {
  var flavorId = flavor instanceof base.Flavor ? flavor.id : flavor;
  var self = this;
  oneandone.getHardwareFlavour(flavorId, function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 200) {
      callback(JSON.parse(body));
      return;
    }
    var flavor = JSON.parse(body);
    callback(null, new compute.Flavor(self, flavor));
  });
};