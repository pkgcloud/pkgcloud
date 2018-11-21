/**
 * Created by Ali Bazlamit on 8/21/2017.
 */

var util = require('util'),
  base = require('../../core/compute/flavor');

var Flavor = exports.Flavor = function Flavor(client, details) {
  base.Flavor.call(this, client, details);
};

util.inherits(Flavor, base.Flavor);

Flavor.prototype._setProperties = function (details) {
  var id = details.id;

  this.id = id;
  this.name = details.name;
  this.ram = details.hardware.ram;
  this.disk = details.hardware.hdds[0] ? details.hardware.hdds[0].size : 0;
  this.cores = details.hardware.vcore;
};
