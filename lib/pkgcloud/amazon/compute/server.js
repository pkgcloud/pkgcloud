/*
 * server.js: AWS Server
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var util  = require('util'),
    base  = require('../../core/compute/server'),
    _     = require('underscore');

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

  ['PublicIpAddress', 'PublicDnsName'].forEach(function (prop) {
    if (typeof details[prop] === 'string') {
      addresses.public.push(details[prop]);
    }
  });

  ['PrivateIpAddress', 'PrivateDnsName'].forEach(function (prop) {
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
  this.flavorId   = details.InstanceType;
  this.original   = this.amazon = details;
};

Server.prototype.toJSON = function () {
  return _.pick(this, ['id', 'name', 'status', 'image', 'addresses', 'launchTime', 'flavor' ]);
};
