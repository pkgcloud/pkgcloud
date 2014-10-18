/*
 * index.js: Top-level include for the Rackspace Cloud BlockStorage module
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

exports.Client = require('./client').Client;
exports.Volume = require('../../openstack/blockstorage/volume').Volume;
exports.VolumeType = require('../../openstack/blockstorage/volumetype').VolumeType;
exports.Snapshot = require('../../openstack/blockstorage/snapshot').Snapshot;

exports.createClient = function (options) {
  return new exports.Client(options);
};
