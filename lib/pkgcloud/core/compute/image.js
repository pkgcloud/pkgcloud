/*
 * image.js: Base image from which all pkgcloud images inherit from
 *
 * (C) 2011 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var util = require('util'),
    model = require('../base/model');

var Image = exports.Image = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(Image, model.Model);

Image.prototype.refresh = function (callback) {
  return this.client.getImage(this, callback);
};

Image.prototype.create = function (callback) {
  return this.client.createImage(this, callback);
};

Image.prototype.destroy = function (callback) {
  return this.client.destroyImage(this, callback);
};