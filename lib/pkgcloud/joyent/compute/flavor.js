/*
 * flavor.js: Joyent Cloud Package
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    base  = require('../../core/compute/flavor');

var Flavor = exports.Flavor = function Flavor(client, details) {
  base.Flavor.call(this, client, details);
};

utile.inherits(Flavor, base.Flavor);
