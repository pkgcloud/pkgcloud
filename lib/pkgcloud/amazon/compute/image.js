/*
 * image.js: AWS Cloud
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var util  = require('util'),
    base  = require('../../core/compute/image'),
    _     = require('lodash');

var Image = exports.Image = function Image(client, details) {
  base.Image.call(this, client, details);
};

util.inherits(Image, base.Image);

Image.prototype._setProperties = function (details) {
  this.id      = details.imageId || details.ImageId;
  this.name    = details.Name || details.ImageLocation.split('/')[1];
  this.created = new Date(0);
  this.blockDeviceMappings = details.BlockDeviceMappings;
  this.details = this.amazon = details;
};

Image.prototype.toJSON = function () {
  return _.pick(this, ['id', 'name', 'created', 'blockDeviceMappings']);
};
