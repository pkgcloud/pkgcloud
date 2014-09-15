/*
 * container.js: AWS S3 Bucket
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var util = require('util'),
    storage   = require('../storage'),
    base  = require('../../core/storage/container'),
    _ = require('underscore');

var Container = exports.Container = function Container(client, details) {
  base.Container.call(this, client, details);
};

util.inherits(Container, base.Container);

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
    details.Contents.forEach(function (file) {
      file.container = self;
      self.files.push(new storage.File(self.client, file));
    });
  }
};

Container.prototype.toJSON = function () {
  return _.pick(this, ['name', 'maxKeys', 'isTruncated' ]);
};

