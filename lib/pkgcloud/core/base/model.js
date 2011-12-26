/*
 * model.js: Base model from which all pkgcloud models inherit from 
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var events = require('eventemitter2');
    utile = require('utile');

var Model = exports.Model = function (client, details) {
  events.EventEmitter2.call(this, { delimiter: '::', wildcard: true });
  this.client = client;
  
  if (details) {
    this._setProperties(details);
  }
};

utile.inherits(Model, events.EventEmitter2);