/*
 * index.js: Top-level include for the Openstack rating module
 *
 * (C) 2015 Hopebaytech
 *      Julian Liu
 * MIT LICENSE
 *
 */

 exports.Client = require('./client').Client;
 exports.DataFrame = require('./dataframe').DataFrame;
 exports.RatedResource = require('./ratedresource').RatedResource;

 exports.createClient = function (options) {
   return new exports.Client(options);
 };
