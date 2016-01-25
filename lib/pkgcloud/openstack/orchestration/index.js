/*
 * index.js: Top-level include for the OpenStack orchestration module
 *
 * (C) 2014 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 */

exports.Client = require('./client').Client;
exports.Stack = require('./stack').Stack;
exports.Resource = require('./resource').Resource;

exports.createClient = function (options) {
  return new exports.Client(options);
};
