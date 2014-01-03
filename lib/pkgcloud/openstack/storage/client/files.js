/*
 * files.js: Instance methods for working with files for Openstack Object Storage
 *
 * (C) 2013 Rackspace, Ken Perkins
 * MIT LICENSE
 *
 */

var fs = require('fs'),
    filed = require('filed'),
    mime = require('mime'),
    request = require('request'),
    utile = require('utile'),
    base = require('../../../core/storage'),
    pkgcloud = require('../../../../pkgcloud'),
    _ = require('underscore'),
    storage = pkgcloud.providers.openstack.storage;

/**
 * client.removeFile
 *
 * @description remove a file from a container
 *
 * @param {String|object}     container     the container or containerName
 * @param {String|object}     file          the file or fileName to delete
 * @param callback
 */
exports.removeFile = function (container, file, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
      fileName = file instanceof base.File ? file.name : file;

  this.request({
      method: 'DELETE',
      container: containerName,
      path: fileName
    }, function(err) {
      return err
        ? callback(err)
        : callback(null, true);
    }
  );
};

/**
 * client.upload
 *
 * @description upload a new file to a container.
 * Returns the pipe interface so you can call:
 *
 * request('http://some.com/file.txt').pipe(client.upload(options));
 *
 * @param {object}          options
 * @param {String|object}   options.container   the container to store the file in
 * @param {String}          options.remote      the file name for the new file
 * @param {String}          [options.local]     an optional local file path to upload
 * @param {Stream}          [options.stream]    optionally explicitly provide the stream instead of pipe
 * @param {object}          [options.headers]   optionally provide headers for the call
 * @param {object}          [options.metadata]  optionally provide metadata for the object
 * @param callback
 * @returns {request|*}
 */
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

/**
 * client.download
 *
 * @description download a file from a container
 * Returns the pipe interface so you can call:
 *
 * client.download(options).pipe(fs.createWriteStream(options2));
 *
 * @param {object}          options
 * @param {String|object}   options.container   the container to store the file in
 * @param {String}          options.remote      the file name for the new file
 * @param {String}          [options.local]     an optional local file path to download to
 * @param {Stream}          [options.stream]    optionally explicitly provide the stream instead of pipe
 * @param callback
 * @returns {request|*}
 */
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

/**
 * client.getFile
 *
 * @description get the details for a specific file
 *
 * @param {String|object}     container     the container or containerName
 * @param {String|object}     file          the file or fileName to get details for
 * @param callback
 */
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

/**
 * client.getFiles
 *
 * @description get the list of files in a container
 *
 * @param {String|object}     container     the container or containerName
 * @param {object|Function}   options
 * @param {Number}            [options.limit]   the number of records to return
 * @param {String}            [options.marker]  the id of the first record to return in the current query
 * @param {Function}          callback
 */
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

/**
 * client.updateFileMetadata
 *
 * @description Updates the specified `file` with the provided metadata `headers`
 * in the Rackspace Cloud Files account associated with this instance.
 *
 * @param {String|object}     container     the container or containerName
 * @param {String|object}     file          the file or fileName to update
 * @param callback
 */
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


