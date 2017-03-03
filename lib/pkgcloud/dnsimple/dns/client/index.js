/*
 * index.js: dnsimple client
 *
 * Tom Gallacher
 */

var util = require('util'),
    dnsimple = require('../../client'),
    urlJoin = require('url-join'),
    _ = require('underscore');

var Client = exports.Client = function (options) {
  dnsimple.Client.call(this, options);

  _.extend(this, require('./records.js'));
  _.extend(this, require('./zones.js'));

  this.serviceType = 'dns';
};

util.inherits(Client, dnsimple.Client);

Client.prototype._getUrl = function (options) {
  options = options || {};

  var root = this.serversUrl
    ? this.protocol + this.serversUrl
    : this.protocol + 'api.dnsimple.com/v1/';

  return urlJoin(root, typeof options === 'string'
    ? options
    : options.path);
};
