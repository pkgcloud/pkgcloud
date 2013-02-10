/*
 * container.js Rackspace Cloudfiles container as CDN
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    base = require('../storage/container');

var Container = exports.Container = function Container(client, details) {
  base.Container.call(this, client, details);

  this.cdnIosUri = details.cdnIosUri;
};

utile.inherits(Container, base.Container);

