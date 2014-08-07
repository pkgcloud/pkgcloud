/*
 * archive.js: Upload an archive into Rackspace Cloud Files
 *
 * (C) 2013 Rackspace, Ken Perkins
 * MIT LICENSE
 *
 */
var fs = require('fs'),
    filed = require('filed');

/**
 * Client.extract
 *
 * @description Upload an archive and instruct Rackspace to extract files to given location
 * @memberof rackspace/storage
 *
 * @param {object}              options     
 * @param {String}              [options.container]     Name of container to extract to
 * @param {String}              [options.format=tar.gz] Format of Archive ( .tar, .tar.gz, .tar.bz2 )
 * @param {Stream}              [options.local]         Input file to read from
 * @param {Stream}              [optoins.stream]        Input stream to read from
 * @param {Function}            callback ( error, true, response )
 */
exports.extract = function(options, callback) {
  var extractOpts, apiStream, inputStream;
  
  if (typeof options === 'function' && !callback) {
    callback = options;
    options = {};
  }
  
  extractOpts = {
    method: 'PUT',
    qs: {},
    upload: true,
    headers: options.headers || {}
  };

  if (options.container) {
    extractOpts.container = options.container;
  }

  extractOpts.qs['extract-archive'] = options.format || 'tar.gz';
  
  if (options.local) {
    inputStream = filed(options.local);
    extractOpts.headers['content-length'] = fs.statSync(options.local).size;
  }
  else if (options.stream) {
    inputStream = options.stream;
  }

  if (inputStream) {
    inputStream.on('response', function(response) {
      response.headers = {
        'content-type': response.headers['content-type'],
        'content-length': response.headers['content-length']
      };
    });
  }

  apiStream = this._request(extractOpts, function (err, body, res) {
    return err
      ? callback && callback(err)
      : callback && callback(null, true, res);
  });

  if (inputStream) {
    inputStream.pipe(apiStream);
  }

  return apiStream;
};
