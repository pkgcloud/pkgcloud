/*
 * client.js: Client for Openstack networking
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var utile = require('utile'),
    urlJoin = require('url-join'),
    openstack = require('../../client'),
    _ = require('underscore');

var Client = exports.Client = function (options) {
  openstack.Client.call(this, options);

  this.serviceType = 'networking';
};

utile.inherits(Client, openstack.Client);
