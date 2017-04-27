/*
 * flavor.js: Azure Cloud Package flavors
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var util = require('util'),
    base  = require('../../core/compute/flavor');

var Flavor = exports.Flavor = function Flavor(client, details) {
  base.Flavor.call(this, client, details);
};

util.inherits(Flavor, base.Flavor);

/**
 * Assign parameters for size specifications according to azure API
 * @param {object} details
 * @param {number} details.maxDataDiskCount
 * @param {number} details.memoryInMB
 * @param {string} details.name
 * @param {number} details.numberOfCores
 * @param {number} details.osDiskSizeInMB
 * @param {number} details.resourceDiskSizeInMB
 * 
 * Todo: Make sure paramters are assigned correctly
 */
Flavor.prototype._setProperties = function (details) {
  var id = details.name;

  this.id   = id;
  this.name = id;
  this.ram  = details.memoryInMB * 1024;
  this.disk = details.maxDataDiskCount;
};
