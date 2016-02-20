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
    openstack.Client.call(this, options);

    _.extend(this, require('./shares'));
    _.extend(this, require('./access'));

    this.serviceType = 'share';
};

util.inherits(Client, openstack.Client);

Client.prototype._getUrl = function (options) {
    options = options || {};

    return urlJoin(this._serviceUrl,
        typeof options === 'string'
            ? options
            : options.path);

};
