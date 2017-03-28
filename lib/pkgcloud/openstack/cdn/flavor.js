/*
 * flavor.js: OpenStack CDN Flavor
 *
 * (C) 2014 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 *
 */

var util  = require('util'),
    base  = require('../../core/base'),
    _     = require('lodash');

var Flavor = exports.Flavor = function Flavor(client, details) {
  base.Model.call(this, client, details);
};

util.inherits(Flavor, base.Model);

Flavor.prototype._setProperties = function (details) {
  this.id = details.id || details['id'];
  this.providers = details.providers || details['providers'];
};

Flavor.prototype.toJSON = function () {
  return _.pick(this, ['id', 'providers']);
};
