/*
 * image.js: Azure OS Images
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var util = require('util'),
    base  = require('../../core/compute/image');

var Image = exports.Image = function Image(client, details, publisher, offer, sku, version) {
  base.Image.call(this, client, details, publisher, offer, sku, version);
};

util.inherits(Image, base.Image);

Image.prototype._setProperties = function (details, publisher, offer, sku, version) {
  this.id           = details.id;
  this.name         = details.name;
  this.location     = details.location;
  this.publisher    = publisher;
  this.offer        = offer;
  this.sku          = sku;
  this.version      = version;
  this.created      = new Date(0);
  this.details      = this.azure = details;
};
