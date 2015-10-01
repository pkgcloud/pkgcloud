/*
 * flavor.js: Base flavor from which all pkgcloud flavors inherit from
 *
 * (C) 2011 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var util = require('util'),
    model = require('../base/model');

var Flavor = exports.Flavor = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(Flavor, model.Model);

Flavor.prototype.refresh = function (callback) {
  return this.client.getFlavor(this, callback);
};
