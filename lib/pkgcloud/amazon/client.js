/*
 * client.js: Base client from which all AWS clients inherit from
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var util = require('util'),
    AWS = require('aws-sdk'),
    request = require('request'),
    pkgcloud = require('../../../../pkgcloud'),
    base = require('../core/base');

var userAgent = AWS.util.userAgent();
var Client = exports.Client = function (options) {
  var self = this;

  base.Client.call(this, options);

  options = options || {};

  // Allow overriding serversUrl in child classes
  this.provider   = 'amazon';
  this.securityGroup = options.securityGroup;
  this.securityGroupId = options.securityGroupId;
  this.version = options.version || '2014-06-15';
  this.protocol = options.protocol || 'https://';
  this.serversUrl = options.serversUrl
    || this.serversUrl
    || 'ec2.amazonaws.com';

  // support either key/accessKey syntax
  this.config.key = this.config.key || options.accessKey;
  this.config.keyId = this.config.keyId || options.accessKeyId;

  // Configure amazon client
  AWS.config.update({ accessKeyId: this.config.keyId, secretAccessKey: this.config.key });
  AWS.config.update({ region: options.region });

  // TODO think about a proxy option for pkgcloud
  // enable forwarding to mock test server
  if (options.serversUrl) {
    AWS.config.update({
      httpOptions: {
        proxy: options.protocol ? options.protocol + options.serversUrl : 'https://' + options.serversUrl
      }
    });
  }

  this.userAgent = util.format('nodejs-pkgcloud/%s %s', pkgcloud.version, userAgent);

  // Setup a custom user agent for pkgcloud
  AWS.util.userAgent = function () {
    return self.userAgent;
  };

  if (!this.before) {
    this.before = [];
  }
};

util.inherits(Client, base.Client);

Client.prototype._toArray = function toArray(obj) {
  if (typeof obj === 'undefined') {
    return [];
  }

  return Array.isArray(obj) ? obj : [obj];
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
