/*
 * files.js: Instance methods for working with files from AWS S3
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var base = require('../../../core/storage'),
  pkgcloud = require('../../../../../lib/pkgcloud'),
  through = require('through2'),
  storage = pkgcloud.providers.amazon.storage,
  _ = require('lodash');

//
// ### function removeFile (container, file, callback)
// #### @container {string} Name of the container to destroy the file in
// #### @file {string} Name of the file to destroy.
// #### @callback {function} Continuation to respond to when complete.
// Destroys the `file` in the specified `container`.
//
exports.removeFile = function (container, file, callback) {
  var self = this;

  if (container instanceof storage.Container) {
    container = container.name;
  }

  if (file instanceof storage.File) {
    file = file.name;
  }

  self.s3.deleteObject({
    Bucket: container,
    Key: file
  }, function (err, data) {
    return err
      ? callback(err)
      : callback(null, !!data.DeleteMarker);
  });
};

exports.upload = function (options) {
  var self = this;

  // check for deprecated calling with a callback
  if (typeof arguments[arguments.length - 1] === 'function') {
    self.emit('log::warn', 'storage.upload no longer supports calling with a callback');
  }

  var s3Options = {
    Bucket: options.container instanceof base.Container ? options.container.name : options.container,
    Key: options.remote instanceof base.File ? options.remote.name : options.remote
  };

  var s3Settings = {
    queueSize: options.queueSize || 1,
    partSize: options.partSize || 5 * 1024 * 1024
  };

  if (options.cacheControl) {
    s3Options.CacheControl = options.cacheControl;
  }

  if (options.contentType) {
    s3Options.ContentType = options.contentType;
  }

  // use ACL until a more obvious permission generalization is available
  if (options.acl) {
    s3Options.ACL = options.acl;
  }

  // add AWS specific options
  if (options.cacheControl) {
    s3Options.CacheControl = options.cacheControl;
  }

  if (options.ServerSideEncryption) {
    s3Options.ServerSideEncryption = options.ServerSideEncryption;
  }

  // add AWS specific options
  if (options.md5) {
    s3Options.ContentMD5 = options.md5;
  }

  // we need a writable stream because aws-sdk listens for an error event on writable
  // stream and redirects it to the provided callback - without the writable stream
  // the error would be emitted twice on the returned proxyStream
  var writableStream = through();
  // we need a proxy stream so we can always return a file model
  // via the 'success' event
  var proxyStream = through();

  s3Options.Body = writableStream;

  var managedUpload = self.s3.upload(s3Options, s3Settings);

  proxyStream.managedUpload = managedUpload;

  managedUpload.send(function (err, data) {
    if (err) {
      return proxyStream.emit('error', err);
    }
    return proxyStream.emit('success', new storage.File(self, data));
  });

  proxyStream.pipe(writableStream);

  return proxyStream;
};

exports.download = function (options) {
  var self = this;

  return self.s3.getObject({
    Bucket: options.container instanceof base.Container ? options.container.name : options.container,
    Key: options.remote instanceof base.File ? options.remote.name : options.remote
  }).createReadStream();

};

exports.getFile = function (container, file, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
    self = this;

  self.s3.headObject({
    Bucket: containerName,
    Key: file
  }, function (err, data) {
    return err
      ? callback(err)
      : callback(null, new storage.File(self, _.extend(data, {
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

  var s3Options = {
    Bucket: containerName
  };

  if (options.marker) {
    s3Options.Marker = options.marker;
  }

  if (options.prefix) {
    s3Options.Prefix = options.prefix;
  }

  if (options.folder) {
    s3Options.Delimiter = '/';
    s3Options.Prefix = `${options.folder}/${s3Options.Prefix || ''}`;
  }

  if (options.maxKeys) {
    s3Options.MaxKeys = options.maxKeys;
  }

  self.s3.listObjects(s3Options, function(err, data) {
    if (err) {
      return callback(err);
    }
    const files = _.filter(data.Contents, item => item.Key != `${options.folder}/`);
    const subFolders = data.CommonPrefixes.length ?
        data.CommonPrefixes.map((prefix) => ({Key: prefix.Prefix, Size: 0})) : [];
    const list = _.concat(subFolders, files);
    list.forEach(item => {
      const keyParts = item.Key.split('/');
      if (item.Size) {
        item.Key = keyParts[keyParts.length - 1];
      } else {
        item.Key = `${keyParts[keyParts.length - 2]}/`;
      }
    });
    callback(null, self._toArray(list).map(function (file) {
      file.container = container;
      return new storage.File(self, file);
    }), {
      isTruncated: data.IsTruncated,
      marker: data.Marker,
      nextMarker: data.NextMarker
    });
  });
};

exports.abortMultiPartUpload = function (options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  else if (!options) {
    options = {};
  }

  var s3Options = {
    Bucket: options.container instanceof base.Container ? options.container.name : options.container,
  };

  if (options.uploadId) {
    s3Options.UploadId = options.uploadId;
  }
  if (options.file) {
    s3Options.Key = options.file;
  }
  self.s3.abortMultipartUpload(s3Options, function (err, data) {
    return err
      ? callback(err)
      : callback(null, data);
  });

};

exports.completeMultiPartUpload = function (options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  else if (!options) {
    options = {};
  }

  var s3Options = {
    Bucket: options.container instanceof base.Container ? options.container.name : options.container,
  };

  if (options.uploadId) {
    s3Options.UploadId = options.uploadId;
  }
  if (options.parts) {
    var multiPartUploadParts = [];
    (options.parts).forEach(element => {
      var part = { ETag: element.etag, PartNumber: element.partNumber };
      multiPartUploadParts.push(part);
    });
    s3Options.MultipartUpload = { Parts: multiPartUploadParts };
  }
  if (options.file) {
    s3Options.Key = options.file;
  }
  self.s3.completeMultipartUpload(s3Options, function (err, data) {
    return err
      ? callback(err)
      : callback(null, data);
  });

};


exports.createMultiPartUpload = function (options, callback) {

  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  else if (!options) {
    options = {};
  }

  var s3Options = {
    Bucket: options.container instanceof base.Container ? options.container.name : options.container,
  };
  if (options.file) {
    s3Options.Key = options.file;
  }
  self.s3.createMultipartUpload(s3Options, function (err, data) {
    return err
      ? callback(err)
      : callback(null, {
        uploadId: data.UploadId
      });
  });

};

exports.uploadPart = function (options) {
  var self = this;
  // check for deprecated calling with a callback
  if (typeof arguments[arguments.length - 1] === 'function') {
    self.emit('log::warn', 'storage.upload no longer supports calling with a callback');
  }

  var s3Options = {
    Bucket: options.container instanceof base.Container ? options.container.name : options.container,
    Key: options.file instanceof base.File ? options.file.name : options.file
  };

  if (options.uploadId) {
    s3Options.UploadId = options.uploadId;
  }

  if (options.partNumber) {
    s3Options.PartNumber = options.partNumber;
  }

  if (options.size) {
    s3Options.ContentLength = options.size;
  }
  if (options.md5) {
    s3Options.ContentMD5 = options.md5;
  }
  // we need a writable stream because aws-sdk listens for an error event on writable
  // stream and redirects it to the provided callback - without the writable stream
  // the error would be emitted twice on the returned proxyStream
  var writableStream = through();
  // we need a proxy stream so we can always return a file model
  // via the 'success' event
  var proxyStream = through();

  s3Options.Body = writableStream;

  var managedUpload = self.s3.uploadPart(s3Options);

  proxyStream.managedUpload = managedUpload;

  managedUpload.send(function (err, data) {
    if (err) {
      return proxyStream.emit('error', err);
    }
    return proxyStream.emit('success', { etag: data.ETag });
  });

  proxyStream.pipe(writableStream);

  return proxyStream;
};

exports.createFolder = function(container, folder, callback) {
  var self = this;

  if (container instanceof storage.Container) {
    container = container.name;
  }
  self.s3.putObject({Bucket: container, Key: `${folder}/`}, callback);
};


