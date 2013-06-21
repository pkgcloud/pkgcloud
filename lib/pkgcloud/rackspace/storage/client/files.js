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
    _ = require('underscore'),
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
      self = this,
      apiStream,
      inputStream,
      uploadOptions;

  if (container instanceof storage.Container) {
    container = container.name;
  }

  uploadOptions = {
    method: 'PUT',
    upload: true,
    container: container,
    path: options.remote,
    headers: options.headers || {}
  };

  if (options.local) {
    inputStream = filed(options.local);
    uploadOptions.headers['content-length'] = fs.statSync(options.local).size;
  }
  else if (options.stream) {
    inputStream = options.stream;
  }

  if (!uploadOptions.headers['content-type']) {
    uploadOptions.headers['content-type'] = mime.lookup(options.remote);
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

  if (options.metadata) {
    uploadOptions.headers = _.extend(uploadOptions.headers,
      self.serializeMetadata(self.OBJECT_META_PREFIX, options.metadata));
  }

  apiStream = this.request(uploadOptions, function (err, body, res) {
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

    if (err) {
      return callback(err);
    }
    else if (!body || !(body instanceof Array)) {
      return new Error('Malformed API Response')
    }

    return callback(null, body.map(function (file) {
      file.container = container;
      return new storage.File(self, file);
    }));
  });
};

//
// ### function updateFileMetadata (container, headers, callback)
// #### @container {Container} Container to update said file in
// #### @file {File} File to update metadata for in Rackspace Cloudfiles.
// #### @callback {function} Continuation to respond to when complete.
// Updates the specified `file` with the provided metadata `headers` in the Rackspace Cloudfiles associated
// with this instance.
//
exports.updateFileMetadata = function (container, file, callback) {
  var self = this,
      containerName = container instanceof base.Container ? container.name : container;

  if (!file instanceof base.File) {
    throw new Error('Must update an existing file instance');
  }

  var updateFileOpts = {
    method: 'POST',
    container: containerName,
    path: file.name,
    headers: self.serializeMetadata(self.OBJECT_META_PREFIX, file.metadata)
  };

  this.request(updateFileOpts, function (err) {
    return err
      ? callback(err)
      : callback(null, file);
  });
};

//
// ### function purgeFileFromCdn (container, file, emails, callback)
// #### @container {string} Name of the container to destroy the file in
// #### @file {string} Name of the file to destroy.
// #### @emails {Array} Optional array of emails to notify on purging
// #### @callback {function} Continuation to respond to when complete.
// Destroys the `file` in the specified `container`.
//
exports.purgeFileFromCdn = function (container, file, emails, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
      fileName = file instanceof base.File ? file.name : file;

  if (typeof emails === 'function') {
    callback = emails;
    emails = [];
  }
  else if (typeof emails === 'string') {
    emails = emails.split(',');
  }

  var purgeOptions = {
    method: 'DELETE',
    container: containerName,
    path: fileName,
    serviceType: this.cdnServiceType
  };

  if (emails.length) {
    purgeOptions.headers = {};
    purgeOptions.headers['x-purge-email'] = emails.join(',');
  }

  this.request(purgeOptions, function (err) {
      return err
        ? callback(err)
        : callback(null, true);
    }
  );
};

