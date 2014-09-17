/*
 * server.js: AWS Server
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var util  = require('util'),
    base  = require('../../core/compute/server');

var Server = exports.Server = function Server(client, details) {
  base.Server.call(this, client, details);
};

util.inherits(Server, base.Server);

Server.prototype._setProperties = function (details) {
  this.id   = details.InstanceId || details.instanceId;
  this.name = details.name || (details.meta || {}).name;

  if (details.State) {
    switch (details.State.Name.toUpperCase()) {
      case 'PENDING':
        this.status = this.STATUS.provisioning;
        break;
      case 'RUNNING':
        this.status = this.STATUS.running;
        break;
      case 'STOPPING':
      case 'STOPPED':
        this.status = this.STATUS.stopped;
        break;
      case 'TERMINATED':
        this.status = this.STATUS.terminated;
        break;
      default:
        this.status = this.STATUS.unknown;
        break;
    }
  }

  var addresses = { private: [], public: [] };

  ['ipAddress', 'dnsName'].forEach(function (prop) {
    if (typeof details[prop] === 'string') {
      addresses.public.push(details[prop]);
    }
  });

  ['privateIpAddress', 'privateDnsName'].forEach(function (prop) {
    if (typeof details[prop] === 'string') {
      addresses.private.push(details[prop]);
    }
  });

  //
  // AWS specific
  //
  this.imageId    = details.ImageId;
  this.addresses  = details.Addresses = addresses;
  this.launchTime = details.LaunchTime;
  this.type       = details.InstanceType;
  this.original   = this.amazon = details;
};
