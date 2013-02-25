/*
 * server.js: Onapp Cloud server
 *
 * 2013 Pedro Dias
 *
 */

var utile = require('utile'),
    base = require('../../core/onapp/server');

var Server = exports.Server = function Server(client, details) {
  base.Server.call(this, client, details);
};

utile.inherits(Server, base.Server);