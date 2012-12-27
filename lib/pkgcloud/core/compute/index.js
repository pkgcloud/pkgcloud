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

exports.serverIp = function (server) {
  return (server.ips && server.ips[0])
    || (
      server.addresses
      && (server.addresses.public || server.addresses.private)
      && (server.addresses.public[0] || server.addresses.private[0])
    );
};