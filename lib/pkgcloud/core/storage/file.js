/*
 * file.js: Base container from which all pkgcloud files inherit from 
 *
 * (C) 2010 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    utile = require('utile'),
    model = require('../base/model'),
    storage = require('../storage');

var File = exports.File = function (client, details) {
  model.Model.call(this, client, details);
};

utile.inherits(File, model.Model);

File.prototype.remove =  function (callback) {
  this.client.removeFile(this.containerName, this.name, callback);
};
  
File.prototype.save = function (options, callback) {
  var self = this;
  var fileStream = fs.createWriteStream(options.local, {
    flags: options.flags || 'w+', 
    encoding: options.encoding || null,
    mode: options.mode || 0666
  });
  
  fs.readFile(this.local, function (err, data) {
    if (err) {
      return callback(err);
    }
    
    function endWrite() {
      fileStream.end();
      callback(null, options.local);
    }
    
    var written = false;
    fileStream.on('drain', function () {
      if (!written) {
        endWrite();
      }
    });
    
    written = fileStream.write(data);
    if (written) {
      endWrite();
    }
  });
};
  
File.prototype.update = function (data, callback) {
  
};
  
File.prototype.__defineGetter__('fullPath', function () {
  return this.client.storageUrl(this.containerName, this.name);
});
  
File.prototype.__defineGetter__('containerName', function () {
  return this.container instanceof storage.Container ? this.container.name : this.container; 
});
