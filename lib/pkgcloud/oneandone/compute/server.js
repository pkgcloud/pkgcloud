/**
 * server.js: 1&1 Server
 *
 * (C) Created by Ali Bazlamit on 8/10/2017.
 *
 */

var util = require('util'),
  _ = require('lodash'),
  base = require('../../core/compute/server');

var Server = exports.Server = function Server(client, details) {
  base.Server.call(this, client, details);
};

util.inherits(Server, base.Server);

Server.prototype._setProperties = function (details) {

  this.id = details.id;
  this.name = details.name;
  this.image = details.image;
  this.imageId = details.image ? details.image.id : details.imageId;
  this.ips = details.ips;
  if (details.datacenter) {
    this.datacenter = details.datacenter;
  }

  switch (details.status && details.status.state) {
    case 'POWERED_ON':
      this.status = 'RUNNING';
      break;
    case 'POWERED_OFF':
      this.status = this.STATUS.stopped;
      break;
    case 'NEW':
    default:
      this.status = 'PROVISIONING';
  }
  this.original = this.oneandone = details;
};

Server.prototype.toJSON = function () {
  return _.pick(this, ['id', 'name', 'image', 'datacenter']);
};