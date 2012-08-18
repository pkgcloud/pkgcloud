/*
 * index.js: Database client for MongoLab databases
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var utile     = require('utile'),
    base      = require('../../../core/base'),
    auth      = require('../../../common/auth')

var Client = exports.Client = function (options) {
  base.Client.call(this, options);
  
  if (!this.before) {
    this.before = [];
  }
  
  this.before.push(auth.basic);

  utile.mixin(this, require('./databases'));
};

utile.inherits(Client, base.Client);

Client.prototype.url = function url () {
  var args = Array.prototype.slice.call(arguments);
  return [
    'https://api.mongolab.com',
    'api', '1', 'partners',
    (this.config.username) ? this.config.username : ''
  ].concat(args).join('/');
};