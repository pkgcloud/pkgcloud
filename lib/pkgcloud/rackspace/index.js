/*
 * index.js: Top-level include for the Rackspace module. 
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile');

exports.cdn     = require('./cdn');
exports.compute = require('./compute');
exports.storage = require('./storage');