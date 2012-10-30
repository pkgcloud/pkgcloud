/*
 * container.js: azure blob
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
  storage   = require('../storage'),
  URL = require('url'),
  PATH = require('path'),
  errs = require('errs'),
  base  = require('../../core/storage/container');

var Container = exports.Container = function Container(client, details) {
  base.Container.call(this, client, details);
};

utile.inherits(Container, base.Container);

Container.getName = function (container) {
  return container instanceof base.Container ? container.name : container;
};


var getStorageInfoFromUri = exports.getStorageInfoFromUri = function (uri, callback) {
  var u, token, path
    info = {};

  u = URL.parse(uri);
  if(!u.host || !u.path) {
    return errs.handle(
      errs.create({
        message: 'invalid Azure container or blob uri'
      }),
      callback
    );
  }

  tokens = u.host.split('.');
  info.storage = tokens[0];

  path = u.path;
  // if necessary, remove leading '/' from path
  if(path.charAt(0) === '/') {
    path = path.substr(1);
  }
  tokens = path.split('/');
  info.container = tokens.shift();
  info.file = tokens.join('/');

  callback(null, info);

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
