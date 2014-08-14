/*
 * index.js: Compute client for Joyent CloudAPI
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var util      = require('util'),
    urlJoin   = require('url-join'),
    joyent    = require('../../client'),
    _ = require('underscore');

var Client = exports.Client = function (options) {
  joyent.Client.call(this, options);

  _.extend(this, require('./flavors'));
  _.extend(this, require('./images'));
  _.extend(this, require('./servers'));
  _.extend(this, require('./keys'));
};

util.inherits(Client, joyent.Client);

Client.prototype._getUrl = function (options) {
  options = options || {};

  var root = this.serversUrl
    ? this.protocol + this.serversUrl
    : this.protocol + 'us-sw-1.api.joyentcloud.com';

  return urlJoin(root, typeof options === 'string'
    ? options
    : options.path);
};
