/*
 * client.js: Database client for Rackspace Cloud Databases
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    request = require('request'),
    rackspace = require('../../client');

var Client = exports.Client = function (options) {
  rackspace.Client.call(this, options);
};

utile.inherits(Client, rackspace.Client);

Client.prototype.url = function () {
  console.log('Argumentos', this.serviceUrl.apply(this, ['database'].concat(Array.prototype.slice.call(arguments))));
  return this.serviceUrl.apply(this, ['database'].concat(Array.prototype.slice.call(arguments)));
};


//
// Gets the version of the Rackspace CloudServers API we are running against
// Parameters: callback
//
Client.prototype.getVersion = function (callback) {
  var versionOptions = {
    uri: 'https://' + this.serversUrl,
  };

  request(versionOptions, function (err, res, body) {
    callback(null, JSON.parse(body).versions);
  });
};
