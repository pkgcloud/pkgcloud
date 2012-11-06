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
  AzureConstants = require('../../utils/constants'),
  pkgcloud = require('../../../../../lib/pkgcloud'),
  storage = pkgcloud.providers.azure2.storage;

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

  this.request('DELETE', [container, file], callback, function (body, res) {
    callback(null, res.statusCode == 204);
  });
};

exports.upload = function (options, callback) {
  if (typeof options === 'function' && !callback) {
    callback = options;
    options = {};
  }

  var container = options.container,
    path,
    rstream,
    lstream;

  if (container instanceof storage.Container) {
    container = container.name;
  }

  options.headers = options.headers || {};

  if (options.local) {
    lstream = filed(options.local);
    options.headers['content-length'] = fs.statSync(options.local).size;
  }
  else if (options.stream) {
    lstream = options.stream;
  }

  if (options.headers && !options.headers['content-type'] && options.remote) {
    options.headers['content-type'] = mime.lookup(options.remote);
  }

  options.headers['x-ms-blob-type'] = AzureConstants.BlobConstants.BlobTypes.BLOCK;

  path = [container + '/' + options.remote];
  if(options.azureBlockId) {
    path[1] = '?comp=block&blockid=' + encodeURIComponent(options.azureBlockId);
  }

  if (options.headers['content-length'] !== undefined) {
    // Regular upload
    rstream = this.request({
      method: 'PUT',
      upload: true,
      path: path,
      headers: options.headers || {}
    }, callback, function (body, res) {
      callback(null, res.statusCode === 200 || res.statusCode === 201);
    });
  } else {
    // Multi-part, 5mb chunk upload
    rstream = this.multipartUpload(options, callback);
  }

  if (lstream) lstream.pipe(rstream);

  return rstream;
};

var getBlockId = function(a, b) {
  return "block" + ((1e15 + a + "").slice(-b));
};

exports.multipartUpload = function (options, callback) {
  var self = this,
    container = options.container,
    chunk = AzureConstants.BlobConstants.DEFAULT_WRITE_BLOCK_SIZE_IN_BYTES,
    numBlocks = 0,
    chunksFinished = [],
    stream = new storage.ChunkedStream(chunk),
    ended = false;

  if (container instanceof storage.Container) {
    container = container.name;
  }

  stream.on('data', function(data) {
    stream.pause();
    options.azureBlockId = getBlockId(numBlocks++, 15);
    options.headers['content-length'] = data.length;
    console.log(data.length);

    var next = function(body, res) {
      if(!ended) {
        stream.resume();
      } else {
        self.sendBlockList(options, numBlocks, callback);
      }
    };

    var rstream = self.upload(options, next);
    rstream.write(data);
    rstream.end();
  });

  stream.on('end', function(data) {
    console.log('stream end');
    ended = true;
  });

  return stream;
};

exports.sendBlockList = function(options, numBlocks, callback) {
  var body,
    container = options.container;

  if (container instanceof storage.Container) {
    container = container.name;
  }

  options.headers = options.headers || {};

  // remove x-ms-blob-type header or request will fail
  if(options.headers['x-ms-blob-type']) {
    delete options.headers['x-ms-blob-type'];
  }

  if(options.headers['content-type']) {
    options.headers['x-ms-blob-content-type'] = options.headers['content-type'];
  } else if (options.remote) {
    options.headers['x-ms-blob-content-type'] = mime.lookup(options.remote);
  }

  path = [container + '/' + options.remote];
  path[1] = '?comp=blocklist';

  body = '<?xml version="1.0" encoding="utf-8"?>';
  body += '<BlockList>';
  for(var i = 0; i < numBlocks; i++) {
    body += '<Latest>' + encodeURIComponent(getBlockId(i,15)) + '</Latest>';
  }
  body += '</BlockList>';

  console.log(body);
  options.headers['content-length'] = body.length;

  this.request({
    method: 'PUT',
    path: path,
    body: body,
    headers: options.headers
  }, callback, function (body, res) {
    callback(null, res.statusCode === 201);
  });
};


exports.multipartUpload2 = function (options, callback) {
  var self = this,
    container = options.container,
    chunk = AzureConstants.BlobConstants.DEFAULT_WRITE_BLOCK_SIZE_IN_BYTES,
    chunksStarted = 0,
    chunksFinished = [],
    stream = new storage.ChunkedStream(chunk),
    ended = false;

  if (container instanceof storage.Container) {
    container = container.name;
  }

  // We're doing a lot of parallel stuff there,
  // but callback should be called only once
  function cb() {
    if (cb.called) return;
    cb.called = true;

    callback.apply(this, arguments);
  };
  cb.called = false;

  // Wait for first data event, probably file is less than 5 mbs and
  // we don't need that multipart thing at all
  stream.once('data', function(data) {
    // Good case - all data fits in one chunk
    if (data.length < chunk) {
      options.headers['content-length'] = data.length;

      // Upload with default method once again
      var rstream = self.upload(options, cb);
      rstream.write(data);
      rstream.end();

      return;
    }

    stream.pause();
    self.xmlRequest(
      'POST',
      [ container, options.remote + '?uploads' ],
      cb,
      function (body, res) {
        if (res.statusCode !== 200) return cb(res.statusCode);

        // Upload rest
        function onChunk(chunk) {
          stream.pause();
          uploadChunk(body.UploadId, chunk, function(err, chunk) {
            if (err) return cb(err);

            finish(chunk);
            stream.resume();
          });
        }
        stream.on('data', onChunk);

        // Upload existing chunk
        onChunk(data);
      }
    );
  });

  stream.on('end', function() {
    ended = true;
    finish();
  });

  function uploadChunk(uploadId, data, callback) {
    // Ignore empty chunks
    if (data.length === 0) return;

    var id = ++chunksStarted,
      chunk = {
        uploadId: uploadId,
        id: id,
        etag: null
      };

    var stream = self.request({
      method: 'PUT',
      upload: true,
      path: [
        container,
        options.remote + '?' + qs.stringify({
          partNumber: id,
          uploadId: uploadId
        })
      ],
      upload: true,
      headers: utile.mixin({}, options.headers, {
        'content-length': data.length
      })
    }, callback, function (body, res) {
      if (res.statusCode != 200) return callback(res.statusCode);

      chunk.etag = res.headers.etag;
      callback(null, chunk);
    });
    stream.write(data);
    stream.end();
  };

  function finish(chunk) {
    if (chunk) chunksFinished.push(chunk);

    // We must send request only if:
    //  - stream was ended
    //  - we was doing multipart request
    //  - all chunks were uploaded
    if (!ended ||
      chunksFinished.length === 0 ||
      chunksFinished.length !== chunksStarted) {
      return;
    }

    // Sort chunks in ascending order
    chunksFinished.sort(function(a, b) {
      return a.id > b.id ? 1 : a.id < b.id ? -1 : 0;
    });

    var body = '<CompleteMultipartUpload>' +
      chunksFinished.map(function(chunk) {
        return '<Part>' +
          '<PartNumber>' + chunk.id + '</PartNumber>' +
          '<ETag>' + chunk.etag + '</ETag>' +
          '</Part>';
      }).join('') +
      '</CompleteMultipartUpload>';

    // Send "Complete Multipart Upload" request
    self.request({
      method: 'POST',
      path: [
        container,
        options.remote + '?' + qs.stringify({
          uploadId: chunksFinished[0].uploadId
        })
      ],
      headers: {
        'Content-Length': Buffer.byteLength(body)
      },
      body: body
    }, cb, function(body, res) {
      cb(null, res.statusCode == 200);
    });
  }

  return stream;
};

exports.download = function (options, callback) {
  var self = this,
    container = options.container,
    lstream,
    rstream;

  if (container instanceof storage.Container) {
    container = container.name;
  }

  if (options.local) {
    lstream = filed(options.local);
  }
  else if (options.stream) {
    lstream = options.stream;
  }

  rstream = this.request({
    path: [container, options.remote],
    download: true
  }, callback, function (body, res) {
    callback(null, new (storage.File)(self, utile.mixin(res.headers, {
      container: container,
      name: options.remote
    })));
  });

  if (lstream) {
    rstream.pipe(lstream);
  }

  return rstream;
};

exports.getFile = function (container, file, callback) {
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

