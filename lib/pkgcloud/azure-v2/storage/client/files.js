/*
 * files.js: Instance methods for working with files for Openstack Object Storage
 *
 * (C) 2013 Rackspace, Ken Perkins
 * MIT LICENSE
 *
 */

var async = require('async');
var filed = require('filed');
var mime = require('mime');
var through = require('through2');
var _ = require('lodash');
var urlJoin = require('url-join');

var constants = require('../../constants');

/**
 * client.removeFile
 *
 * @description remove a file from a container
 *
 * @param {String|object}     container     the container or containerName
 * @param {String|object}     file          the file or fileName to delete
 * @param callback
 */
exports.removeFile = function (container, file, options, callback) {
  options = options || {};
  var containerName = container instanceof this.models.Container ? container.name : container;
  var fileName = file instanceof this.models.File ? file.name : file;
  var azureContainerName = options.storage && options.storage.container || constants.DEFAULT_STORAGE_CONTAINER;

  this.getBlobService(azureContainerName, containerName, function (err, blobService) {

    if (err) {
      return callback(err);
    }

    blobService.deleteBlob(azureContainerName, fileName, function (err) {
      return err ?
          callback(err) :
          callback(null, true);
    });
  });
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
exports.TODO_bulkDelete = function(container, files, callback) {
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
exports.TODO_upload = function (options) {
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
  options = options || {};
  var containerName = container instanceof this.models.Container ? container.name : container;
  var azureContainer = options.container || constants.DEFAULT_STORAGE_CONTAINER;
  var blobs = [];
  
  self.getBlobService(azureContainer, containerName, function (err, blobService) {

    if (err) {
      return callback(err);
    }

    var aggregateBlobs = function (err, result, cb) {
      if (err) {
        cb(err);
      } else {
        blobs = blobs.concat(result.entries);
        if (result.continuationToken !== null) {
          blobService.listBlobsSegmented(azureContainer, result.continuationToken, aggregateBlobs);
        } else {
          cb(null, blobs);
        }
      }
    };

    blobService.listBlobsSegmented(azureContainer, null, function(err, result) {
      aggregateBlobs(err, result, function (err, blobs) {
        return err ?
          callback(err) :
          callback(null, blobs.map(function (blob) { 
            return new self.models.File(self, blob); 
          }));
      });
    });

  });
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
exports.getFile = function (container, file, options, callback) {
  
  var self = this;
  options = options || {};
  var containerName = container instanceof this.models.Container ? container.name : container;
  var azureContainerName = options.storage && options.storage.container || constants.DEFAULT_STORAGE_CONTAINER;
  var fileName = file instanceof this.models.File ? file.name : file;

  self.getBlobService(azureContainerName, containerName, function (err, blobService) {

    if (err) {
      return callback(err);
    }

    blobService.getBlobProperties(azureContainerName, fileName, function (err, properties, status) {
      return err ?
        callback(err) : (!status || !status.isSuccessful) ?
        callback(new Error(`status is not successfull: ${JSON.stringify(status || null)}`)) :
        callback(null, new self.models.File(self, properties));
    });
  });
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
  var self = this;
  var container = options.container;
  var containerName = container instanceof this.models.Container ? container.name : container;
  var azureContainerName = options.storage && options.storage.container || constants.DEFAULT_STORAGE_CONTAINER;
  var blobName = options.remote instanceof this.models.File ? options.remote.name : options.remote;
  var inputStream;
  
  if (options.local) {
    inputStream = filed(options.local);
  }
  else if (options.stream) {
    inputStream = options.stream;
  }

  var blobService;
  async.waterfall([
    function (next) {
      self.getBlobService(azureContainerName, containerName, next);
    },
    function (_blobService, next) {

      blobService = _blobService;
      blobService.getBlobProperties(azureContainerName, blobName, function (err, properties, status) {
        return err ?
          next(err) : (!status || !status.isSuccessful) ?
          next(new Error(`status is not successfull: ${JSON.stringify(status || null)}`)) :
          next(null, properties);
      });
    },
    function (properties, next) {
      blobService.createReadStream(azureContainerName, blobName).pipe(inputStream);
      return next();
    }
  ], callback);

  return inputStream;
};