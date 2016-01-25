/*
 * index.js: Top-level include for the Openstack Ceilometer module
 *
 * (C) 2016 Hans Cornelis
 * MIT LICENSE
 *
 */

exports.Client = require('./client/index').Client;

exports.createClient = function (options) {
    return new exports.Client(options);
};
/**
 * Created by hacor on 25.01.16.
 */
