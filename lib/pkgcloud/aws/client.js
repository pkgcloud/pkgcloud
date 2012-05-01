/*
 * client.js: Base client from which all AWS clients inherit from
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    request = require('request'),
    qs = require('querystring'),
    xml2js = require('xml2js'),
    auth = require('../common/auth'),
    base = require('../core/base');

var Client = exports.Client = function (options) {
  base.Client.call(this, options);

  // Allow overriding serversUrl in child classes
  this.serversUrl = (options || {}).serversUrl ||
                    this.serversUrl ||
                    'ec2.amazonaws.com';
  this.provider   = 'aws';

  this.version = '2012-04-01';

  if (!this.before) {
    this.before = [];
  }

  this.before.push(auth.awsSignature);
};
utile.inherits(Client, base.Client);

Client.prototype.query = function query(action, query, errback, callback) {
  return this.request(
      '?' + qs.stringify(utile.mixin({ Action: action }, query)),
      errback,
      function (body, res) {
        var parser = new xml2js.Parser();

        parser.parseString(body, function (err, data) {
          if (err) return errback(err);
          callback(data, res);
        });
      }
  );
};


Client.prototype.failCodes = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Resize not allowed',
  404: 'Item not found',
  409: 'Build in progress',
  413: 'Over Limit',
  415: 'Bad Media Type',
  500: 'Fault',
  503: 'Service Unavailable'
};

Client.prototype.successCodes = {
  200: 'OK',
  201: 'Created',
  202: 'Accepted',
  203: 'Non-authoritative information',
  204: 'No content'
};
