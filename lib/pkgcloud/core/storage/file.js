/*
 * file.js: Base container from which all pkgcloud files inherit from
 *
 * (C) 2010 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    utile = require('utile'),
    model = require('../base/model'),
    storage = require('../storage');

var File = exports.File = function (client, details) {
  model.Model.call(this, client, details);
};

utile.inherits(File, model.Model);

File.prototype.remove = File.prototype.rm = function (callback) {
  this.client.removeFile(this.containerName, this.name, callback);
};

File.prototype.download = function (options, callback) {
  this.client.download(options, callback);
};

File.prototype.update = function (data, callback) {

};

File.prototype.__defineGetter__('fullPath', function () {
  return this.client.storageUrl(this.containerName, this.name);
});

File.prototype.__defineGetter__('containerName', function () {
  return this.container instanceof storage.Container ? this.container.name : this.container;
});
