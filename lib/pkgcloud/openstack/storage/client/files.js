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
    util = require('util'),
    base = require('../../../core/storage'),
    pkgcloud = require('../../../../pkgcloud'),
    errs = require('errs'),
    through = require('through2'),
    _ = require('underscore'),
    urlJoin = require('url-join'),
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
  var containerName = container instanceof this.models.Container ? container.name : container,
      fileName = file instanceof this.models.File ? file.name : file;

  this._request({
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
 * client.bulkDelete
 *
 * @description remove a list of files from a container
 *
 * @param {String|object}     container     the container or containerName
 * @param {array}             files         the files or fileNames to delete
 * @param callback
 */
exports.bulkDelete = function(container, files, callback) {
  var self = this,
      containerName = container instanceof this.models.Container ? container.name : container;
  this._request({
    method: 'DELETE',
    body: files.map(function(file) {
      return urlJoin(containerName, (file instanceof self.models.File ? file.name : file));
    }).join('\r\n'),
    headers: {
      'Content-Type': 'text/plain'
    },
    qs: {
      'bulk-delete': true
    }
  }, function(err, results) {
    return err
      ? callback(err)
      : callback(null, results);
  });
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
exports.upload = function (options) {
  var self = this;

  // check for deprecated calling with a callback
  if (typeof arguments[arguments.length - 1] === 'function') {
    self.emit('log::warn', 'storage.upload no longer supports calling with a callback');
  }

  var container = options.container,
      writableStream,
      proxyStream = through(),
      uploadOptions = {
        method: 'PUT',
        upload: true,
        container: container,
        path: options.remote,
        headers: options.headers || {}
      };

  if (options.container instanceof this.models.Container) {
    uploadOptions.container = options.container.name;
  }

  if (options.contentType) {
    uploadOptions.headers['content-type'] = options.contentType;
  }
  else {
    uploadOptions.headers['content-type'] = mime.lookup(options.remote);
  }

  if (options.metadata) {
    uploadOptions.headers = _.extend(uploadOptions.headers,
      self.serializeMetadata(self.OBJECT_META_PREFIX, options.metadata));
  }

  writableStream = this._request(uploadOptions);

  writableStream.on('complete', function(response) {
    var err = self._parseError(response);

    if (err) {
      proxyStream.emit('error', err);
      return;
    }

    // load the file metadata from the cloud, so we can return a proper model
    self.getFile(uploadOptions.container, options.remote, function (err, file) {
      if (err) {
        proxyStream.emit('error', err);
        return;
      }

      proxyStream.emit('success', file);
    });
  });

  writableStream.on('error', function (err) {
    proxyStream.emit('error', err);
  });

  writableStream.on('data', function (chunk) {
    proxyStream.emit('data', chunk);
  });

  // we need a proxy stream so we can always return a file model
  // via the 'success' event
  proxyStream.pipe(writableStream);

  return proxyStream;
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
      success = callback ? onDownload : null,
      container = options.container,
      inputStream,
      apiStream;

  //
  // Optional helper function passed to `this._request`
  // in the case when no callback is passed to `.download(options)`.
  //
  function onDownload(err, body, res) {
    return err
      ? callback(err)
      : callback(null, new self.models.File(self, _.extend(res.headers, {
          container: container,
          name: options.remote
        })));
  }

  if (container instanceof self.models.Container) {
    container = container.name;
  }

  if (options.local) {
    inputStream = filed(options.local);
  }
  else if (options.stream) {
    inputStream = options.stream;
  }

  apiStream = this._request({
    container: container,
    path: options.remote,
    download: true
  }, success);

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
  var containerName = container instanceof this.models.Container ? container.name : container,
      self = this;

  this._request({
    method: 'HEAD',
    container: containerName,
    path: file,
    qs: {
      format: 'json'
    }
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, new self.models.File(self, _.extend(res.headers, {
          container: container,
          name: file
        })));
  });
};

/**
 * client.getFiles
 *
 * @description get the list of files in a container. Returns at most 10,000 files if options.limit is unspecified.
 * Abstracts the aggregation of files in the case that options.limit is >10,000.
 *
 * @param {String|object}     container     the container or containerName
 * @param {object|Function}   options
 * @param {Number}            [options.limit]   the number of records to return
 * @param {String}            [options.marker]  the id of the first record to return in the current query
 * @param {Function}          callback
 */
exports.getFiles = function (container, options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  else if (!options) {
    options = {};
  }

  // If limit is not specified, or it is <=10k, just make a single request
  if (!options.limit || options.limit <= 10000) {
    return this._getFiles(container, options, callback);
  }

  // Limit is specified and is >10k. Abstract the aggregation of files (cloudfiles returns max 10k at once)
  var files = [];

  // Keep track of how many files are left to collect
  var remainingLimit = options.limit;
  delete options.limit;

  var getFilesCallback = function(err, someFiles) {
    if (err) {
      return callback(err);
    }

    files = files.concat(someFiles);
    remainingLimit -= someFiles.length;

    // Check if we should attempt to retrieve more results
    if (remainingLimit > 0 && someFiles.length === 10000) {
      options.marker = someFiles.pop().name;

      // Once the remainingLimit value becomes < 10000, we must pass it
      if (remainingLimit < 10000) {
        options.limit = remainingLimit;
      }

      self._getFiles(container, options, getFilesCallback);
    } else {
      callback(null, files);
    }
  };

  this._getFiles(container, options, getFilesCallback);
};

exports._getFiles = function (container, options, callback) {
  var containerName = container instanceof this.models.Container ? container.name : container,
      self = this;

  var getFilesOpts = {
      path: containerName,
      qs: _.extend({
          format: 'json'
      }, _.pick(options, ['limit', 'marker', 'prefix', 'path', 'delimiter']))
    };

    if (options.endMarker) {
      getFilesOpts.qs.end_marker = options.endMarker;
    }

  if (options.end_marker) {
    getFilesOpts.qs.end_marker = options.end_marker;
  }

  if (options.prefix) {
    getFilesOpts.qs.prefix  = options.prefix;
  }

  if (options.path) {
    getFilesOpts.qs.path  = options.path;
  }

  if (options.delimiter) {
    getFilesOpts.qs.delimiter  = options.delimiter;
  }

  this._request(getFilesOpts, function (err, body) {

    if (err) {
      return callback(err);
    }
    else if (!body || !(body instanceof Array)) {
      return new Error('Malformed API Response')
    }

    return callback(null, body.map(function (file) {
      file.container = container;
      return new self.models.File(self, file);
    }));
  });
};

/**
 * client.updateFileMetadata
 *
 * @description Updates the specified `file` with the provided metadata `headers`
 * in the Openstack account associated with this instance.
 *
 * @param {String|object}     container     the container or containerName
 * @param {String|object}     file          the file or fileName to update
 * @param callback
 */
exports.updateFileMetadata = function (container, file, callback) {
  var self = this,
      containerName = container instanceof self.models.Container ? container.name : container;

  if (!file instanceof base.File) {
    throw new Error('Must update an existing file instance');
  }

  var updateFileOpts = {
    method: 'POST',
    container: containerName,
    path: file.name,
    headers: self.serializeMetadata(self.OBJECT_META_PREFIX, file.metadata)
  };

  this._request(updateFileOpts, function (err) {
    return err
      ? callback(err)
      : callback(null, file);
  });
};


