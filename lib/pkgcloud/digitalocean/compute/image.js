/*
 * image.js: DigitalOcean Image
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
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
  this.created = details.created_at;

  //
  // DigitalOcean specific
  //
  this.distribution = details.distribution;
  this.public = details.public;
  this.slug = details.slug;
  this.original     = this.digitalocean = details;
};