var azure = require('azure');
var errs = require('errs');
var URL = require('url');

var getStorageInfoFromUri = exports.getStorageInfoFromUri = function (uri, callback) {
  var u, token, path
    info = {};

  u = URL.parse(uri);
  if(!u.host || !u.path) {
    return errs.handle(
      errs.create({
        message: 'invalid Azure container or blob uri'
      }),
      callback
    );
  }

  tokens = u.host.split('.');
  info.storage = tokens[0];

  path = u.path;
  // if necessary, remove leading '/' from path
  if(path.charAt(0) === '/') {
    path = path.substr(1);
  }
  tokens = path.split('/');
  info.container = tokens.shift();
  info.file = tokens.join('/');

  callback(null, info);

};