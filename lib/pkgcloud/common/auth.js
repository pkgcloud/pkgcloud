/*
 * auth.js: Utilities for authenticating with multiple cloud providers
 *
 * (C) 2011-2012 Nodejitsu Inc.
 *
 */

var httpSignature = require('./http-signature'),
    utile = require('utile');

var auth = exports;

auth.authToken = function authToken(req) {
  req.headers = req.headers || {};
  req.headers['x-auth-token'] = this.config.authToken;
};

<<<<<<< HEAD
auth.basic = function basicAuth(req) {
  var credentials = this.credentials 
    || this.config.username + ':' + this.config.password;

  req.headers = req.headers || {};
  req.headers.authorization = [
    'Basic', 
    utile.base64.encode(credentials)
  ].join(' ');
};

// Add Account number for requests to rackspace API
auth.accountId = function (req) {
  req.headers = req.headers || {};
  req.headers['x-auth-project-id'] = this.config.accountNumber;
};

auth.httpSignature = function httpSignatureAuth(req, keys) {
  keys = keys || this.config;
  httpSignature.sign(req, {
    key: keys.key,
    keyId: keys.keyId
  });
};
