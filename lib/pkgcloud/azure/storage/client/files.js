/*
 * files.js: Instance methods for working with files from AWS S3
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
  filed = require('filed'),
  mime = require('mime'),
  request = require('request'),
  utile = require('utile'),
  qs = require('querystring'),
  base = require('../../../core/storage'),
  pkgcloud = require('../../../../../lib/pkgcloud'),
  nopstream = require('./nopstream'),
  storage = pkgcloud.providers.azure.storage;

//
// ### function removeFile (container, file, callback)
// #### @container {string} Name of the container to destroy the file in
// #### @file {string} Name of the file to destroy.
// #### @callback {function} Continuation to respond to when complete.
// Destroys the `file` in the specified `container`.
//
exports.removeFile = function (container, file, callback) {
  callback(new Error('removeFile not implemented'));
  return;

  if (container instanceof storage.Container) {
    container = container.name;
  }

  if (file instanceof storage.File) {
    file = file.name;
  }

  this.request('DELETE', [container, file], callback, function (body, res) {
    callback(null, res.statusCode == 204);
  });
};

exports.upload = function (options, callback) {

  var containerName = storage.Container.getName(options.container),
    blobClient = this._getBlobService();

  var uploadOptions = {
    contentType: mime.lookup(options.remote),
    metadata: { fileName: options.remote }
  };

  try {
    blobClient.createBlockBlobFromFile(containerName, options.remote, options.local, uploadOptions, function (error) {
      if(!error){
        callback(null,true);
      } else {
        callback(error);
      }
    });
  } catch (ex) {
    callback(ex);
  }

  // TODO: we are NOT returning a stream
  return null;
};



exports.download = function (options, callback) {

  var containerName = storage.Container.getName(options.container),
    self = this,
    blobClient = this._getBlobService();


  //var writestream = fs.createWriteStream('task1-download.txt');
  var writestream = new nopstream.NopStream();

  try {
    blobClient.getBlobToStream(containerName, options.remote, writestream, function(error, serverBlob, res){
      if(!error){
        //TODO: should I use serverBlob or res???
        callback(null, new (storage.File)(self, utile.mixin(res.headers, {
          container: options.container,
          name: options.remote
        })));
      } else {
        callback(error)
      }
    });
  } catch(ex) {
    callback(ex);
  }

  return writestream;
};

exports.getFile = function (container, file, callback) {

  callback(new Error('getFile not implemented'));
  return;

  var containerName = container instanceof base.Container ? container.name : container,
    self = this;

  this.request({
    method: 'HEAD',
    path: [containerName, file ]
  }, callback, function (body, res) {
    callback(null, new storage.File(self, utile.mixin(res.headers, {
      container: container,
      name: file
    })));
  });
}

exports.getFiles = function (container, download, callback) {
  callback(new Error('getFiles not implemented'));
  return;
  var containerName = container instanceof base.Container ?
      container.name
      :
      container,
    self = this;

  this.xmlRequest([ containerName ], callback, function (body, res) {
    callback(null, self._toArray(body.Contents).map(function (file) {
      file.container = container;
      return new storage.File(self, file);
    }));
  });
};

