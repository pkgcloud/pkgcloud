/*
 * index.js: Openstack rating (cloudkitty) client
 *
 * (C) 2015 Hopebaytech
 *      Julian Liu
 * MIT LICENSE
 *
 */

var util = require('util'),
    urlJoin = require('url-join'),
    openstack = require('../../client'),
    _ = require('underscore');

var Client = exports.Client = function (options) {
  openstack.Client.call(this, options);

  _.extend(this, require('./dataframes'));
  _.extend(this, require('./reports'));
  _.extend(this, require('./hashmaps'));
  _.extend(this, require('./quotes'));

  this.serviceType = 'rating';
};

util.inherits(Client, openstack.Client);

Client.prototype._getUrl = function (options) {
  options = options || {};

  if (!this._serviceUrl) {
    throw new Error('Service url not found');
  }

  return urlJoin(this._serviceUrl,
    typeof options === 'string'
      ? options
      : options.path);

};
