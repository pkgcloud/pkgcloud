/*
 * flavor.js: Openstack Trove Databases flavor
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var util = require('util'),
    base = require('../../openstack/compute/flavor');

var Flavor = exports.Flavor = function Flavor(client, details) {
  base.Flavor.call(this, client, details);
};

util.inherits(Flavor, base.Flavor);

Flavor.prototype._setProperties = function (details) {
  var selfLink = details.links.filter(function (link) {
    return (link.rel === 'self');
  });
  this.href = selfLink.pop().href;
  this.id = details.id;
  this.name = details.name;
  this.ram = details.ram;
};
