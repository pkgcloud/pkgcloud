/*
 * servers.js: Instance methods for working with servers from Joyent Cloud
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */
var request = require('request'),
    base = require('../../../core/compute'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    compute = pkgcloud.providers.rackspace.compute;

// ### function getVersion (callback) 
//
// Gets the current API version
//
// #### @callback {function} f(err, version).
//
exports.getVersion = function (callback) {
  var versionOptions = {
    uri: 'https://' + this.serversUrl,
  };

  request(versionOptions, function (err, res, body) {
    console.log(JSON.parse(body),res)
    callback(null, JSON.parse(body).versions);
  });
};