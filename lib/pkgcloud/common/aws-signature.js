/*
 * aws-signature.js: Implmentation of authentication for Amazon AWS APIs.
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var url = require('url'),
    qs = require('querystring'),
    crypto = require('crypto');

exports.sign = function sign(req, options) {
  if (!options) options = {};

  if (typeof options.key !== 'string') {
    throw new TypeError('`key` is a required argument for aws-signature');
  }

  if (typeof options.keyId !== 'string') {
    throw new TypeError('`keyId` is a required argument for aws-signature');
  }

  var signatureString = [
        req.method, '\n',
        this.serversUrl, '\n',
        '/', '\n'
      ],
      query = qs.parse(req.path.slice(1));

  query.AWSAccessKeyId = options.keyId;
  query.SignatureMethod = 'HmacSHA256';
  query.SignatureVersion = 2;
  query.Version = this.version;
  query.Timestamp = new Date(+new Date + 36e5 * 30).toISOString();

  Object.keys(query).sort().forEach(function (key, i) {
    if (i !== 0) signatureString.push('&');
    signatureString.push(encodeURIComponent(key), '=', encodeURIComponent(query[key]));
  });

  var toSign = signatureString.join('');

  // Crappy code, but AWS seems to need it
  toSign = toSign.replace(/!/g, '%21');
  toSign = toSign.replace(/'/g, '%27');
  toSign = toSign.replace(/\*/g, '%2A');
  toSign = toSign.replace(/\(/g, '%28');
  toSign = toSign.replace(/\)/g, '%29');

  query.Signature = crypto.createHmac(
      'sha256',
      options.key
  ).update(toSign).digest('base64');

  req.path = '?' + Object.keys(query).sort().map(function (key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
  }).join('&');
};
