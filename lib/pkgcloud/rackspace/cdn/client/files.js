/*
 * files.js Instance methods for working with files from Rackspace Cloudfiles
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

var base = require('../../../core/storage'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    storage = pkgcloud.providers.rackspace.storage;

exports.removeFile = function (container, file, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
      self = this;

  if (this.authorized) {
    request();
  }
  else {
    this.auth(request);
  }

  function request () {
    var options = {
      method: 'DELETE',
      url: self.serviceUrl.apply(self, ['storage', containerName, file])
    };
    self.request(options, callback, callback.bind(null, null, true));
  }
};

exports.getFile = function (container, file, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
      self = this;

  if (this.authorized) {
    request();
  }
  else {
    this.auth(request);
  }
  function request () {
    var options = {
      method: 'HEAD',
      url: self.serviceUrl.apply(self, ['storage', containerName, file, true])
    };
    self.request(options, callback, function (body, res) {
      callback(null, new storage.File(self, utile.mixin(res.headers, {
        container: containerName,
        name: file
      })));
    });
  }
};

exports.getFiles = function (container, callback) {
  var containerName = container instanceof base.Container ? container.name : container,
      self = this;
  if (this.authorized) {
    request();
  }
  else {
    this.auth(request);
  }

  function request () {
    var options = {
      method: 'GET',
      url: self.serviceUrl.apply(self, ['storage', containerName, true])
    };
    self.request(options, callback, function (body, res) {
      callback(null, body.map(function (file) {
        file.container = containerName;
        return new storage.File(self, file);
      }));
    });
  }
};
