/*
 * files.js: Instance methods for working with files from Rackspace Cloudfiles
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var request = require('request'),
    base = require('../../../core/storage'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    storage = pkgcloud.providers.rackspace.storage;

//
// ### function destroyFile (container, file, callback)
// #### @container {string} Name of the container to destroy the file in
// #### @file {string} Name of the file to destroy.
// #### @callback {function} Continuation to respond to when complete.
// Destroys the `file` in the specified `container`.
//
exports.destroyFile = function (container, file, callback) {
  common.rackspace('DELETE', this.storageUrl(container, file), this, function (body, res) {
    callback(null, true);
  });
};

exports.addFile = function (container, options, callback) {
  if (typeof options === 'function' && !callback) {
    callback = options;
    options = {};
  }

  var lstream,
      addOptions,
      size;

  if (options.local) {
    lstream = fs.createReadStream(options.local, options.fs);
    options.headers = options.headers || {};
    options.headers['content-length'] = fs.statSync(options.local).size;
  }
  else if (options.stream) {
    lstream = options.stream;
  }
  
  if (!lstream) {
    return callback(new Error('.local or .stream is required to addFile.'))
  }
  
  addOptions = {
    method: 'PUT',
    client: this,
    upload: lstream,
    uri: this.storageUrl(container, options.remote),
    headers: options.headers || {}
  };
  
  if (options.headers && !options.headers['content-type']) {
    options.headers['content-type'] = mime.lookup(options.remote);
  }
  
  return common.rackspace(addOptions, callback, function (body, res) {
    callback(null, true);
  });
};

exports.getFile = function (container, filename, callback) {
  var self = this, 
      containerPath = path.join(this.config.cache.path, container),
      cacheFile = path.join(containerPath, filename),
      options;
  
  common.statOrMkdirp(containerPath);
  
  var lstream = fs.createWriteStream(cacheFile),
      rstream,
      options;
      
  options = {
    method: 'GET', 
    client: self,
    uri: self.storageUrl(container, filename),
    download: lstream
  };

  rstream = common.rackspace(options, callback, function (body, res) {
    var file = {
      local: cacheFile,
      container: container,
      name: filename,
      bytes: res.headers['content-length'],
      etag: res.headers['etag'],
      last_modified: res.headers['last-modified'],
      content_type: res.headers['content-type']
    };

    callback(null, new (cloudfiles.StorageObject)(self, file));
  });
};

exports.getFiles = function (container, download, callback) {
  var self = this;
  
  //
  // Download is optional argument
  // And can be only: true, false, [array of files]
  //
  // Also download can be omitted: (...).getFiles(container, callback);
  // In this case second argument will be a function
  //
  if (typeof download === 'function' && !(download instanceof RegExp)) {
    callback = download;
    download = false;
  }

  common.rackspace(this.storageUrl(container, true), this, callback, function (body) {
    var files = JSON.parse(body);
    
    // If download == false or wasn't defined
    if (!download) {
      var results = files.map(function (file) {
        file.container = container;
        return new (cloudfiles.StorageObject)(self, file);
      });
      
      callback(null, results);
      return;
    }
    
    var batch;
    
    if (download instanceof RegExp || download == true) {
      // If download == true
      // Download all files
      if (download !== true) {
        files = files.filter(function (file) {
          return download.test(file.name);
        });
      }
      
      // Create a batch
      batch = files.map(function (file) {
        return function (callback) {
          self.getFile(container, file.name, callback);
        }
      });      
    } 
    else if (Array.isArray(download)) {
      // Go through all files that we've asked to download 
      batch = download.map(function (file) {
        var exists = files.some(function (item) {
          return item.name == file
        });
        
        // If file exists - get it
        // If not report about error
        return exists ?
            function (callback) {
              self.getFile(container, file, callback);
            } :
            function (callback) {
              callback(Error('File : ' + file + ' doesn\'t exists'));
            };
      });
    } 
    else {
      callback(Error('"download" argument can be only boolean, array or regexp'));
    }
    
    // Run batch
    common.runBatch(batch, callback);
  });
};

