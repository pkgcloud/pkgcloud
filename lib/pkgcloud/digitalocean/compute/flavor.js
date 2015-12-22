/*
 * flavor.js: DigitalOcean Server "Size"
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var util = require('util'),
    base  = require('../../core/compute/flavor');

var Flavor = exports.Flavor = function Flavor(client, details) {
  base.Flavor.call(this, client, details);
};

util.inherits(Flavor, base.Flavor);

Flavor.prototype._setProperties = function (details) {
  this.id   = details.slug;
  this.name = details.slug;
  this.ram  = details.memory;
  this.disk = details.disk;

  //
  // DigitalOcean specific
  //
  this.cpu          = details.vcpus;
  this.costPerHour  = details.price_hourly;
  this.costPerMonth = details.price_monthly;
  this.original     = this.digitalocean = details;
};