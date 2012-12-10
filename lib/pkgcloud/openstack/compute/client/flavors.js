/*
 * flavors.js: Implementation of OpenStack Flavors Client.
 *
 * (C) 2013, Nodejitsu Inc.
 *
 */

//
// ### function getFlavors (callback) 
// #### @callback {function} f(err, flavors). `flavors` is an array that
// represents the flavors that are available to your account
//
// Lists all flavors available to your account.
//
exports.getFlavors = function getFlavors(callback) {
  var self = this;
  return this._request('flavors', callback, function (body, res) {
    callback(null, body.flavors.map(function (result) {
      return new compute.Flavor(self, result);
    }), res);
  });
};