/*
 * client.js: Base client from which all Google Cloud Storage clients inherit from
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var util = require('util'),
  base = require('../core/base');

var Client = exports.Client = function (options) {
  base.Client.call(this, options);

  options = options || {};

  this.provider = 'google';
  this.config.keyFilename = this.config.keyFilename || options.keyFilename;
  this.config.projectId = this.config.projectId || options.projectId;
};

util.inherits(Client, base.Client);
