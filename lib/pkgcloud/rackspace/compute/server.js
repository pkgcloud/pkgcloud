/*
 * server.js: Rackspace Cloud server
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var util = require('util'),
    base = require('../../openstack/compute/server');

var Server = exports.Server = function Server(client, details) {
  base.Server.call(this, client, details);
};

util.inherits(Server, base.Server);
