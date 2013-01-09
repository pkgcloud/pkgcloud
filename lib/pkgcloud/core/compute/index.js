/*
 * index.js: Top-level include from which all pkgcloud compute models inherit.
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */
 
exports.Bootstrapper = require('./bootstrapper').Bootstrapper;
exports.Flavor       = require('./flavor').Flavor;
exports.Image        = require('./image').Image;
exports.Server       = require('./server').Server;

exports.serverPass = function (server) {
  if (server.adminPass) {
    return server.adminPass;
  }
  else if (server.metadata) {
    return server.metadata['root']
  }
  
  return '';
};

//
// ### function serverIp (server)
// #### @server {Object} Server to extract the IP from.
//
// Attempts to return the `server` IP.
//
exports.serverIp = function (server) {
  if (!server && !server.ips && !server.addresses) {
    return null;
  }

  var networks,
      interfaces;

  if (server.ips) {
    //
    // Joyent uses the format { ips: ['23.23.23.23', '10.0.0.1'] }
    //
    return server.ips[0];
  }
  else if (server.addresses.public || server.addresses.private) {
    //
    // Rackspace and most sane providers use:
    //
    // addresses: {
    //   public: ['23.23.23.23'],
    //   private: ['10.0.0.1']
    // }
    //
    return (server.addresses.public || server.addresses.private)[0];
  }
  else if (server.addresses) {
    //
    // OpenStack uses a non-standard set of names
    //
    // addresses: {
    //   vlan01: [
    //     { version: 4, addr: '10.0.0.1' }
    //     { version: 4, addr: '23.23.23.23' }
    //   ]
    // }
    //
    networks = Object.keys(server.addresses);
    if (!networks.length) {
      return null;
    }

    interfaces = server.addresses[networks[0]];

    return (interfaces[1] && interfaces[1].addr)
      || (interfaces[0] && interfaces[0].addr)
      || null;
  }
};