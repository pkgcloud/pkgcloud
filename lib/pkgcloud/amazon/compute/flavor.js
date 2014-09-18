/*
 * flavor.js: AWS Cloud Package
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var util  = require('util'),
    base  = require('../../core/compute/flavor'),
    _     = require('underscore');

var Flavor = exports.Flavor = function Flavor(client, details) {
  base.Flavor.call(this, client, details);
};

util.inherits(Flavor, base.Flavor);

Flavor.options = {

  // Previous Generation Instance Types
  'm1.small': { id: 'm1.small', ram: 1.7 * 1024, disk: 160 },
  'm1.medium': { id: 'm1.medium', ram: 3.75 * 1024, disk: 410 },
  'm1.large': { id: 'm1.large', ram: 7.5 * 1024, disk: 2 * 420 },
  'm1.xlarge': { id: 'm1.xlarge', ram: 15 * 1024, disk: 4 * 420 },
  'c1.medium': { id: 'c1.medium', ram: 1.7 * 1024, disk: 350 },
  'c1.xlarge': { id: 'c1.xlarge', ram: 7 * 1024, disk: 4 * 420 },
  'cc2.8xlarge': { id: 'cc2.8xlarge', ram: 60.5 * 1024, disk: 4 * 840 },
  'm2.xlarge': { id: 'm2.xlarge', ram: 17.1 * 1024, disk: 420 },
  'm2.2xlarge': { id: 'm2.2xlarge', ram: 34.2 * 1024, disk: 850 },
  'm2.4xlarge': { id: 'm2.4xlarge', ram: 68.4 * 1024, disk: 2 * 840 },
  'cr1.8xlarge': { id: 'cr1.8xlarge', ram: 244 * 1024, disk: 2 * 120 },
  'hi1.4xlarge': { id: 'hi1.4xlarge', ram: 60.5 * 1024, disk: 2 * 1024 },
  'cg1.4xlarge': { id: 'cg1.4xlarge', ram: 22.5 * 1024, disk: 2 * 840 },
  't1.micro': { id: 't1.micro', ram: 613, disk: 0},

  // Current Generation Instance Types
  't2.micro': { id: 't2.micro', ram: 1024, disk: 0 },
  't2.small': { id: 't2.small', ram: 2 * 1024, disk: 0 },
  't2.medium': { id: 't2.medium', ram: 4 * 1024, disk: 0 },
  'm3.medium': { id: 'm3.medium', ram: 3.75 * 1024, disk: 4 },
  'm3.large': { id: 'm3.large', ram: 7.5 * 1024, disk: 32 },
  'm3.xlarge': { id: 'm3.xlarge', ram: 15 * 1024, disk: 2 * 40 },
  'm3.2xlarge': { id: 'm3.2xlarge', ram: 30 * 1024, disk: 2 * 80 },
  'c3.large': { id: 'c3.large', ram: 3.75 * 1024, disk: 2 * 16 },
  'c3.xlarge': { id: 'c3.xlarge', ram: 7.5 * 1024, disk: 2 * 40 },
  'c3.2xlarge': { id: 'c3.2xlarge', ram: 15 * 1024, disk: 2 * 80 },
  'c3.4xlarge': { id: 'c3.4xlarge', ram: 30 * 1024, disk: 2 * 160 },
  'c3.8xlarge': { id: 'c3.8xlarge', ram: 60 * 1024, disk: 2 * 320 },
  'g2.2xlarge': { id: 'g2.2xlarge', ram: 15 * 1024, disk: 60 },
  'r3.large': { id: 'r3.large', ram: 15.25 * 1024, disk: 32 },
  'r3.xlarge': { id: 'r3.xlarge', ram: 30.5 * 1024, disk: 80 },
  'r3.2xlarge': { id: 'r3.2xlarge', ram: 61 * 1024, disk: 160 },
  'r3.4xlarge': { id: 'r3.4xlarge', ram: 122 * 1024, disk: 320 },
  'r3.8xlarge': { id: 'r3.8xlarge', ram: 244 * 1024, disk: 2 * 320 },
  'i2.xlarge': { id: 'i2.xlarge', ram: 30.5 * 1024, disk: 800 },
  'i2.2xlarge': { id: 'i2.2xlarge', ram: 61 * 1024, disk: 2 * 800 },
  'i2.4xlarge': { id: 'i2.4xlarge', ram: 122 * 1024, disk: 4 * 800 },
  'i2.8xlarge': { id: 'i2.8xlarge', ram: 244 * 1024, disk: 8 * 800 },
  'hs1.8xlarge': { id: 'hs1.8xlarge', ram: 117 * 1024, disk: 24 * 2000 }

};

Flavor.prototype._setProperties = function (details) {
  var id = details.name || 'm1.small';

  if (!Flavor.options[id]) throw new TypeError('No such AWS Flavor: ' + id);

  this.id   = id;
  this.name = id;
  this.ram  = Flavor.options[id].ram;
  this.disk = Flavor.options[id].disk;
};

Flavor.prototype.toJSON = function () {
  return _.pick(this, ['id', 'name', 'ram', 'disk' ]);
};