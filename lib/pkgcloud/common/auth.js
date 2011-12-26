/*
 * auth.js: Utilities for authenticating with multiple cloud providers
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */
 
var httpSignature = require('http-signature'),
    utile = require('utile'); 

var auth = exports;

auth.authToken = function (req) {
  req.headers = req.headers || {};
  req.headers['x-auth-token'] = this.authToken;
};

auth.basic = function (req) {
  req.headers = req.headers || {};
  req.headers['authorization'] = ['Basic', utile.base64.encode(this.credentials)].join(' ');
};

auth.httpSignature = function (req) {
  httpSignature.sign(req, {
    key: this.key,
    keyId: this.keyId
  });
};