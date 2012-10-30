/*
 * files.js: Instance methods for working with files from Azure Blob Storage
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
  var containerName = storage.Container.getName(container),
    fileName = storage.File.getName(file),
    blobClient = this._getBlobService();

  blobClient.deleteBlob(containerName, fileName, function(err,res) {
    callback(err, res);
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
    blobClient.createBlockBlobFromFile(containerName, options.remote, options.local, uploadOptions, function (error, response) {
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

  var containerName = storage.Container.getName(container),
    self = this,
    options =  {},
    blobClient = this._getBlobService();

  try {
    blobClient.getBlobProperties (containerName, file, options,
      function(error, blob, res){
        if(error){
          callback(error);
        } else {
          callback(null, new storage.File(self, utile.mixin(res.headers, {
            container: container,
            name: file
          })));
        }
      }
    );
  } catch(ex) {
    callback(ex);
  }
};

exports.getFiles = function (container, download, callback) {
  var containerName = storage.Container.getName(container),
    self = this,
    options =  {},
    blobClient = this._getBlobService();

  try {
    blobClient.listBlobs(containerName, options,
      function(error, blobs, res){
        if(error){
          callback(error);
        } else {
          callback(null, self._toArray(blobs).map(function (blob) {
            var file = {
              container: container,
              name: blob.name
            };
            return new storage.File(self, file);
          }));
        }
      }
    );
  } catch(ex) {
    callback(ex);
  }
};


