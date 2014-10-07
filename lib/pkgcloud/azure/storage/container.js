/*
 * container.js: Azure container
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var util = require('util'),
    storage   = require('../storage'),
    _ = require('underscore'),
    base  = require('../../core/storage/container');

var Container = exports.Container = function Container(client, details) {
  base.Container.call(this, client, details);
};

util.inherits(Container, base.Container);

Container.prototype._setProperties = function (details) {
  var self = this;

  if (typeof details === 'string') {
    this.name = details;
    return;
  }

  this.name = details.Name;

  //
  // Azure specific
  //
  this.original = this.azure = details;

};

Container.prototype.toJSON = function () {
  return _.pick(this, ['name']);
};
