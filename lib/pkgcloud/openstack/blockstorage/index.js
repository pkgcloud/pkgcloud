/*
 * index.js: Top-level include for the Openstack Block Storage module
 *
 * (C) 2014 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

exports.Client = require('./client').Client;
exports.Volume = require('./volume').Volume;
exports.VolumeType = require('./volumetype').VolumeType;
exports.Snapshot = require('./snapshot').Snapshot;

exports.createClient = function (options) {
  return new exports.Client(options);
};
