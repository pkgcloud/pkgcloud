/*
 * files.js: Instance methods for working with files from Rackspace Cloudfiles
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    filed = require('filed'),
    mime = require('mime'),
    request = require('request'),
    utile = require('utile'),
    base = require('../../../core/storage'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    storage = pkgcloud.providers.rackspace.storage;

//
// ### function removeFile (container, file, callback)
// #### @container {string} Name of the container to destroy the file in
// #### @file {string} Name of the file to destroy.
// #### @callback {function} Continuation to respond to when complete.
// Destroys the `file` in the specified `container`.
//
exports.removeFile = function (container, file, callback) {
  var containerName = container instanceof base.Container ? container.name : container;

  this.request({
      method: 'DELETE',
      container: containerName,
      path: file
    }, function(err) {
      return err
        ? callback(err)
        : callback(null, true);
    }
  );
};

exports.upload = function (options, callback) {
  if (typeof options === 'function' && !callback) {
    callback = options;
    options = {};
  }

  var container = options.container,
      apiStream,
      inputStream;

  if (container instanceof storage.Container) {
    container = container.name;
  }

  if (options.local) {
    inputStream = filed(options.local);
    options.headers = options.headers || {};
    options.headers['content-length'] = fs.statSync(options.local).size;
  }
  else if (options.stream) {
    inputStream = options.stream;
  }

  if (options.headers && !options.headers['content-type']) {
    options.headers['content-type'] = mime.lookup(options.remote);
  }

  // If the inputStream is a request stream, headers are automatically
  // copied from the source stream to the destination stream.
  // As CloudFiles uses ETag to compute an md5 hash, this leads to a case
  // where a remote resource with an ETag, piped via request to CloudFiles with
  // pkgcloud, would result in a 422 "Unable to Process" error.
  //
  // As a result, we explicitly only opt in 'Content-Type' and 'Content-Length'
  // if there is a response handler on the inputStream
  if (inputStream) {
    inputStream.on('response', function(response) {
      response.headers = {
        'content-type': response.headers['content-type'],
        'content-length': response.headers['content-length']
      }
    });
  }

  apiStream = this.request({
    method: 'PUT',
    upload: true,
    container: container,
    path: options.remote,
    headers: options.headers || {}
  }, function (err, body, res) {
    return err
      ? callback && callback(err)
      : callback && callback(null, true, res);
  });

  if (inputStream) {
    inputStream.pipe(apiStream);
  }

  return apiStream;
};

exports.download = function (options, callback) {
  var self = this,
      container = options.container,
      inputStream,
      apiStream;

  if (container instanceof storage.Container) {
    container = container.name;
  }

  if (options.local) {
    inputStream = filed(options.local);
  }
  else if (options.stream) {
    inputStream = options.stream;
  }

  apiStream = this.request({
    container: container,
    path: options.remote,
    download: true
  }, function (err, body, res) {
    return err
      ? callback && callback(err)
      : callback && callback(null, new (storage.File)(self, utile.mixin(res.headers, {
          container: container,
          name: options.remote
        })));
  });

  if (inputStream) {
    apiStream.pipe(inputStream);
  }

  return apiStream;
};

exports.getFile = function (container, file, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
      self = this;

  this.request({
    method: 'HEAD',
    container: containerName,
    path: file,
    qs: {
      format: 'json'
    }
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, new storage.File(self, utile.mixin(res.headers, {
          container: container,
          name: file
        })));
  });
};

exports.getFiles = function (container, options, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
      self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var getFilesOpts = {
    path: containerName,
    qs: {
      format: 'json'
    }
  };

  if (options.limit) {
    getFilesOpts.qs.limit = options.limit;
  }

  if (options.marker) {
    getFilesOpts.qs.marker = options.marker;
  }

  this.request(getFilesOpts, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body.map(function (file) {
          file.container = container;
          return new storage.File(self, file);
        }));
  });
};

