/*
 * server.js: Base server from which all pkgcloud servers inherit from 
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    model = require('../model');

var Image = exports.Image = function (client, details) {
  model.Model.call(this, client, details);

  this.serverUrl = client.serverUrl;
};

utile.inherits(Image, model.Model);

Image.prototype.refresh = function (callback) {
  this.client.getImage(this, callback);
};

Image.prototype.create = function (callback) {
  this.client.createImage(this, callback);
};

Image.prototype.destroy = function (callback) {
  this.client.destroyImage(this, callback);
};