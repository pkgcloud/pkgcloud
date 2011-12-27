/*
 * image.js: Rackspace Cloud image
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    base = require('../../core/compute/image');

var Image = exports.Image = function (client, details) {
  base.Image.call(this, client, details);
};

utile.inherits(Image, base.Image);

Image.prototype._setProperties = function (details) {
  this.id = details.id;
  this.name = details.name;
  this.updated = details.updated;
  this.created = details.created;
  this.status = details.status;
  this.progress = details.progress;
};