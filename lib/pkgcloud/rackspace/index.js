/*
 * index.js: Top-level include for the Rackspace module. 
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile');

exports.cdn = require('./cdn');
exports.compute = require('./compute');
exports.storage = require('./storage');
exports.Client  = require('./client').Client;

exports.cdn.createClient = function (options) {
  var client = new exports.Client(options);
  
  utile.mixin(client, require('./storage/cdn/containers'));
  utile.mixin(client, require('./storage/cdn/directories'));
  utile.mixin(client, require('./storage/cdn/files'));
  
  return client;
};

exports.compute.createClient = function (options) {
  var client = new exports.Client(options);
  
  utile.mixin(client, require('./storage/client/servers'));
  utile.mixin(client, require('./storage/client/images'));
  utile.mixin(client, require('./storage/client/flavors'));
  
  return client;
};

exports.storage.createClient = function (options) {
  var client = new exports.Client(options);
  
  utile.mixin(client, require('./storage/client/containers'));
  utile.mixin(client, require('./storage/client/directories'));
  utile.mixin(client, require('./storage/client/files'));
  
  return client;
};