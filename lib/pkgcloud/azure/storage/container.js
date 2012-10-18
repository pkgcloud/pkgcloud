/*
 * container.js: azure blob
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    storage   = require('../storage'),
    base  = require('../../core/storage/container');

var Container = exports.Container = function Container(client, details) {
  base.Container.call(this, client, details);
};

utile.inherits(Container, base.Container);

// TODO: should this be in core/base? We need to keep this DRY
Container.getName = function (container) {
  return container instanceof base.Container ? container.name : container;
};

Container.prototype._setProperties = function (details) {
  var self = this;

  if (typeof details === 'string') {
    this.name = details;
    return;
  }

  this.name = details.Name;

  //
  // AWS specific
  //

  this.maxKeys = details.MaxKeys;
  this.isTruncated = details.IsTruncated === 'true';

  if (details.Contents) {
    this.client._toArray(details.Contents).forEach(function (file) {
      file.container = self;
      self.files.push(new storage.File(client, file));
    });
  }
};
