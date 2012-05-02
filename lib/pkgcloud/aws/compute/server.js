/*
 * server.js: AWS Server
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    base  = require('../../core/compute/server');

var Server = exports.Server = function Server(client, details) {
  base.Server.call(this, client, details);
};

utile.inherits(Server, base.Server);

Server.prototype._setProperties = function (details) {
  this.id   = details.instanceId;
  this.name = 'unknown';

  if (details.instanceState) {
    switch (details.instanceState.name.toUpperCase()) {
      case 'PENDING':
        this.status = "PROVISIONING";
        break;
      case 'RUNNING':
        this.status = "RUNNING";
        break;
      case 'STOPPING':
      case 'STOPPED':
        this.status = "STOPPED";
        break;
      default:
        this.status = "UNKNOWN";
        break;
    }
  }

  //
  // AWS specific
  //

  this.imageId   = details.imageId;
  this.launchTime = details.launchTime;
  this.type      = details.instanceType;
  this.original  = this.aws = details;

};
