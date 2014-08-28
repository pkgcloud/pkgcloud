/*
 * image.js: DigitalOcean Image
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var util = require('util'),
    base  = require('../../core/compute/image');

var Image = exports.Image = function Image(client, details) {
  base.Image.call(this, client, details);
};

util.inherits(Image, base.Image);

Image.prototype._setProperties = function (details) {
  this.id   = details.id;
  this.name = details.name;

  //
  // DigitalOcean specific
  //
  this.distribution = details.distribution;
  this.original     = this.digitalocean = details;
};