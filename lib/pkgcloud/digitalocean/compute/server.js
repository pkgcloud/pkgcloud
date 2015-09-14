/*
 * server.js: DigitalOcean Server
 *
 * (C) 2013 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var util    = require('util'),
    base    = require('../../core/compute/server');

var Server = exports.Server = function Server(client, details) {
  base.Server.call(this, client, details);
};

util.inherits(Server, base.Server);

Server.prototype._setProperties = function (details) {
  var self = this;

  function getAddresses(networks) {
    networks.forEach(function (network) {
      self.addresses[network.type].push(network.ip_address);
    });
  }

  this.id        = details.id;
  this.name      = details.name;
  this.imageId   = details.image.id;
  this.flavorId  = details.size_slug;
  this.addresses = {
    public: [],
    private: []
  };

  if (details.networks.v4) {
    getAddresses(details.networks.v4);
  }

  if (details.networks.v6) {
    getAddresses(details.networks.v6);
  }

  switch (details.status && details.status.toUpperCase()) {
    case 'ACTIVE':
      this.status = 'RUNNING';
      break;
    case 'OFF':
      this.status = this.STATUS.stopped;
      break;
    case 'NEW':
    default:
      this.status = 'PROVISIONING';
  }

  //
  // DigitalOcean specific
  //
  this.region   = details.region_id;
  this.created  = details.created_at;
  this.original = this.digitalocean = details;
};

