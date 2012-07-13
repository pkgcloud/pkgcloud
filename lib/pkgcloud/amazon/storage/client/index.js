/*
 * client.js: Storage client for AWS S3
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    xml2js = require('xml2js'),
    auth = require('../../../common/auth'),
    amazon = require('../../client');

var Client = exports.Client = function (options) {
  this.serversUrl = 's3.amazonaws.com';

  amazon.Client.call(this, options);

  utile.mixin(this, require('./containers'));
  utile.mixin(this, require('./files'));

  this.before.push(auth.amazon.headersSignature);
};

utile.inherits(Client, amazon.Client);

Client.prototype.xmlRequest = function query(method, url, errback, callback) {
  // .xmlRequest(['url'], errback, callback)
  if (typeof url === 'function') {
    callback = errback;
    errback = url;
    url = method;
    method = 'GET';
  }

  return this.request(method, url, errback, function (body, res) {
    var parser = new xml2js.Parser();

    parser.parseString(body || '', function (err, data) {
      if (err) return errback(err);
      callback(data, res);
    });
  });
};

Client.prototype.url = function () {
  var args = Array.prototype.slice.call(arguments),
      bucket = args.shift();

  return [
    'https://' +
    (bucket ? bucket + '.' : '') +
    this.serversUrl
  ].concat(args).join('/');
};
