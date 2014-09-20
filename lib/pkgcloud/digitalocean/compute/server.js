/*
 * server.js: DigitalOcean Server
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

var util    = require('util'),
    compute = require('../../core/compute'),
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
  this.flavorId  = details.size.id;
  this.addresses = {
    public: [],
    private: []
  };

  getAddresses(details.networks.v4);
  getAddresses(details.networks.v6);

  switch (details.status && details.status.toUpperCase()) {
    case 'ACTIVE':
      this.status = "RUNNING";
      break;
    case 'NEW':
    default:
      this.status = 'PROVISIONING';
  }

  //
  // DigitalOcean specific
  //
  this.region   = details.region_id;
  this.original = this.digitalocean = details;
};
