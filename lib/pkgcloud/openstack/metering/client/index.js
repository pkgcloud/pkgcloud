/*
 * index.js: Openstack Ceilometer client
 *
 * (C) 2015 Hans Cornelis
 * MIT LICENSE
 *
 */

var util = require('util'),
    urlJoin = require('url-join'),
    openstack = require('../../client'),
    _ = require('underscore');

var Client = exports.Client = function (options) {
    options.version = options.version || 'v2';
    openstack.Client.call(this, options);

    _.extend(this, require('./meters'));
    _.extend(this, require('./samples'));

    this.serviceType = 'metering';
};

util.inherits(Client, openstack.Client);

Client.prototype._getUrl = function (options) {
    options = options || {};

    return urlJoin(this._serviceUrl,
        typeof options === 'string'
            ? options
            : options.path);

};
