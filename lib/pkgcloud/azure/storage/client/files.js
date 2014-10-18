/*
 * files.js: Instance methods for working with files (blobs) from Azure
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var fs = require('fs'),
  filed = require('filed'),
  through = require('through2'),
  mime = require('mime'),
  request = require('request'),
  util = require('util'),
  urlJoin = require('url-join'),
  qs = require('querystring'),
  base = require('../../../core/storage'),
  AzureConstants = require('../../utils/constants'),
  pkgcloud = require('../../../../../lib/pkgcloud'),
  storage = pkgcloud.providers.azure.storage,
  _ = require('underscore');

//
// ### function removeFile (container, file, callback)
// #### @container {string} Name of the container to destroy the file in
// #### @file {string} Name of the file to destroy.
// #### @callback {function} Continuation to respond to when complete.
// Destroys the `file` in the specified `container`.
//
exports.removeFile = function (container, file, callback) {
  if (container instanceof storage.Container) {
    container = container.name;
  }

  if (file instanceof storage.File) {
    file = file.name;
  }

  this._request({
    method:'DELETE',
    path: urlJoin(container, file)
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, res.statusCode == 202);
  });
};

exports.upload = function (options) {
  var self = this;

  // check for deprecated calling with a callback
  if (typeof arguments[arguments.length - 1] === 'function') {
    self.emit('log::warn', 'storage.upload no longer supports calling with a callback');
  }

  // if we don't have a size, we need to immediately jump into multipart upload
  if (!options.size) {
    return self.multipartUpload(options);
  }

  var writableStream,
      proxyStream = through(),
      uploadOptions = {
        method: 'PUT',
        upload: true,
        headers: options.headers || {}
      };

  if (options.container instanceof storage.Container) {
    uploadOptions.path = urlJoin(options.container.name, options.remote);
  }
  else {
    uploadOptions.path = urlJoin(options.container, options.remote);
  }

  if (options.contentType) {
    uploadOptions.headers['content-type'] = options.contentType;
  }
  else {
    uploadOptions.headers['content-type'] = mime.lookup(options.remote);
  }

  uploadOptions.headers['content-length'] = options.size;
  uploadOptions.headers['x-ms-blob-type'] = AzureConstants.BlobConstants.BlobTypes.BLOCK;

  writableStream = self._request(uploadOptions);

  writableStream.on('complete', function(response) {
    var err = self._parseError(response);

    if (err) {
      proxyStream.emit('error', err);
      return;
    }

    // load the file metadata from the cloud, so we can return a proper model
    self.getFile(options.container, options.remote, function (err, file) {
      if (err) {
        proxyStream.emit('error', err);
        return;
      }

      proxyStream.emit('success', file);
    });
  });

  writableStream.on('error', function(err) {
    proxyStream.emit('err', err);
  });

  writableStream.on('data', function (chunk) {
    proxyStream.emit('data', chunk);
  });

  // we need a proxy stream so we can always return a file model
  // via the 'success' event
  proxyStream.pipe(writableStream);

  return proxyStream;
};

var getBlockId = function (a, b) {
  return "block" + ((1e15 + a + "").slice(-b));
};

exports.multipartUpload = function (options) {
  var self = this,
    numberOfBlocks = 0,
    chunkedStream = new storage.ChunkedStream(AzureConstants.BlobConstants.DEFAULT_WRITE_BLOCK_SIZE_IN_BYTES),
    proxyStream = through(),
    ended = false;

  // for each chunk of data, we need to upload a block
  chunkedStream.on('data', function (data) {
    chunkedStream.pause();

    var blockOptions = {
      container: options.container,
      remote: options.remote,
      headers: options.headers || {},
      size: data.length,
      blockId: getBlockId(numberOfBlocks++, 15)
    };

    var writableStream = self.uploadBlock(blockOptions);

    writableStream.on('error', function(err) {
      chunkedStream.emit('error', err);
    });

    // when the block has been uploaded, resume if more data
    writableStream.on('complete', function(response) {
      var err = self._parseError(response);

      if (err) {
        chunkedStream.emit('error', err);
        ended = true;
      }
      else if (!ended) {
        chunkedStream.resume();
      }
      else {
        // when we're done with data, we need to upload the block list
        self.sendBlockList(_.extend({
          numberOfBlocks: numberOfBlocks
        } ,_.pick(options, ['remote', 'container', 'headers', 'contentType'])), function(err) {
          if (err) {
            proxyStream.emit('error', err);
            return;
          }

          // finally, fetch the file, and emit success on the original stream
          self.getFile(options.container, options.remote, function(err, file) {
            if (err) {
              proxyStream.emit('error', err);
              return;
            }

            proxyStream.emit('success', file);
          });
        });
      }
    });

    // write the chunk to the block stream, and end it.
    writableStream.write(data);
    writableStream.end();
  });

  chunkedStream.on('end', function () {
    ended = true;
  });

  chunkedStream.on('error', function(err) {
    proxyStream.emit('error', err);
  });

  proxyStream.pipe(chunkedStream);

  return proxyStream;
};

exports.sendBlockList = function (options, callback) {
  var putOptions = {
      method: 'PUT',
      headers: options.headers || {},
      qs: {
        comp: 'blocklist'
      }
    };

  if (options.container instanceof storage.Container) {
    putOptions.path = urlJoin(options.container.name, options.remote);
  }
  else {
    putOptions.path = urlJoin(options.container, options.remote);
  }

  // remove x-ms-blob-type header or request will fail
  if (putOptions.headers['x-ms-blob-type']) {
    delete putOptions.headers['x-ms-blob-type'];
  }

  if (options.contentType) {
    putOptions.headers['x-ms-blob-content-type'] = options.contentType;
  } else if (options.remote) {
    putOptions.headers['x-ms-blob-content-type'] = mime.lookup(options.remote);
  }

  putOptions.body = '<?xml version="1.0" encoding="utf-8"?>';
  putOptions.body += '<BlockList>';
  for (var i = 0; i < options.numberOfBlocks; i++) {
    putOptions.body += '<Latest>' + encodeURIComponent(getBlockId(i, 15)) + '</Latest>';
  }
  putOptions.body += '</BlockList>';

  putOptions.headers['content-length'] = putOptions.body.length;

  this._request(putOptions, function (err, body, res) {
    return err
      ? callback && callback(err)
      : callback && callback(null, res.statusCode === 201, res);
  });
};

exports.uploadBlock = function(options) {
  var uploadOptions = {
      method: 'PUT',
      upload: true,
      headers: {
        'content-length': options.size
      },
      qs: {
        comp: 'block',
        blockid: options.blockId
      }
    };

  if (options.container instanceof storage.Container) {
    uploadOptions.path = urlJoin(options.container.name, options.remote);
  }
  else {
    uploadOptions.path = urlJoin(options.container, options.remote);
  }

  return this._request(uploadOptions);
};

exports.download = function (options, callback) {
  var self = this,
      success = callback ? onDownload : null,
      container = options.container,
      lstream,
      rstream;

  //
  // Optional helper function passed to `this._request`
  // in the case when no callback is passed to `.download(options)`.
  //
  function onDownload(err, body, res) {
    return err
      ? callback(err)
      : callback(null, new (storage.File)(self, _.extend(res.headers, {
          container: container,
          name: options.remote
        })));
  }

  if (container instanceof storage.Container) {
    container = container.name;
  }

  if (options.local) {
    lstream = filed(options.local);
  }
  else if (options.stream) {
    lstream = options.stream;
  }

  rstream = this._request({
    path: urlJoin(container, options.remote),
    download: true
  }, success);

  if (lstream) {
    rstream.pipe(lstream);
  }

  return rstream;
};

exports.getFile = function (container, file, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
    self = this;

  this._request({
    method: 'GET',
    path: urlJoin(containerName, file)
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, new storage.File(self, _.extend(res.headers, {
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
  else if (!options) {
    options = {};
  }

  this._xmlRequest({
    method: 'GET',
    path: containerName,
    qs: {
      restype: 'container',
      comp: 'list'
    }
  }, function (err, body, res) {
    if (err) {
      return callback(err);
    }
    if (body.Blobs && body.Blobs.Blob) {
      return callback(null, self._toArray(body.Blobs.Blob).map(function (file) {
        file.container = container;
        return new storage.File(self, file);
      }));
    }

    callback(null, []);
  });
};

