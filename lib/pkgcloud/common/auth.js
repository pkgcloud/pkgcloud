/*
 * auth.js: Utilities for authenticating with multiple cloud providers
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var httpSignature = require('./http-signature'),
    utile = require('utile');

var auth = exports;

auth.authToken = function (req) {
  req.headers = req.headers || {};
  req.headers['x-auth-token'] = this.config.authToken;
};

auth.basic = function (req) {
  var credentials = this.credentials 
                 || this.config.username + ':' + this.config.password;

  req.headers = req.headers || {};
  req.headers.authorization = 
    ['Basic', utile.base64.encode(credentials)].join(' ');
};

auth.httpSignature = function (req) {
  req = httpSignature.sign(req, {
    key: this.config.key,
    keyId: this.config.keyId
  });
};
