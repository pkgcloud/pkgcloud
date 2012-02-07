/*
 * image.js: Rackspace Cloud image
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    base = require('../../core/compute/image');

var Image = exports.Image = function Image(client, details) {
  base.Image.call(this, client, details);
};

utile.inherits(Image, base.Image);

Image.prototype._setProperties = function (details) {
  this.id           = details.id;
  this.name         = details.name;
  this.created      = details.created;
  // joyent specific
  this.urn          = details.urn;
  this.os           = details.os;
  this.type         = details.type;
  this.description  = details.description;
  this["default"]   = details["default"];
  this.version      = details.version;
  this.requirements = details.requirements;
};