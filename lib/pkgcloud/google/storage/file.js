/*
 * container.js: Google Cloud Storage File
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var util  = require('util'),
  base  = require('../../core/storage/file'),
  _ = require('underscore');

var File = exports.File = function File(client, details) {
  base.File.call(this, client, details);
};

util.inherits(File, base.File);

File.prototype._setProperties = function (file) {
  this.name = file.name;
  this.metadata = file.metadata;
  _.extend(this, file.metadata);

  if (this.size) {
    this.size = parseInt(this.size, 10);
  }
};

File.prototype.toJSON = function () {
  return this.metadata;
};