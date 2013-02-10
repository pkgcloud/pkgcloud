/*
 * index.js: Top-level include for the Rackspace cdn module
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

exports.Client      = require('./client').Client;
exports.Container   = require('./container').Container;

exports.createClient = function (options) {
    return new exports.Client(options);
};
