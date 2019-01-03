/*
 * image.js: OAO
 *
 * (C) Created by Ali Bazlamit on 8/19/2017.
 *
 */

var util = require('util'),
  base = require('../../core/compute/image'),
  _ = require('lodash');

var Image = exports.Image = function Image(client, details) {
  base.Image.call(this, client, details);
};

util.inherits(Image, base.Image);

Image.prototype._setProperties = function (details) {
  this.id = details.id;
  this.name = details.name;
  this.server_id = details.server_id;
};

Image.prototype.toJSON = function () {
  return _.pick(this, ['id', 'name', 'server_id']);
};
