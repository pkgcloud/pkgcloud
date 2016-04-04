/*
 * image.js: OpenStack Cloud image
 *
 * (C) 2013 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
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
  this.id      = details.id;
  this.name    = details.name;
  this.created = details.created;

  //
  // OpenStack specific
  //
  this.updated  = details.updated;
  this.status   = details.status;
  this.progress = details.progress;
};

Image.prototype.toJSON = function () {
  return _.pick(this, ['id', 'name', 'status', 'progress', 'created', 'updated']);
};