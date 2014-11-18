/*
 * client.js: Base client from which all Google Cloud Storage clients inherit from
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var util = require('util'),
  gcloud = require('gcloud'),
  base = require('../core/base');

var Client = exports.Client = function (options) {
  var self = this;

  base.Client.call(this, options);

  options = options || {};

  this.provider = 'google';
  this.config.keyFilename = this.config.keyFilename || options.keyFilename;
  this.config.projectId = this.config.projectId || options.projectId;

  this.gcloud = gcloud(this.config);
};

util.inherits(Client, base.Client);
