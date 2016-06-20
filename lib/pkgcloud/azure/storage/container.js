/*
 * container.js: Azure container
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var util = require('util'),
    _ = require('lodash'),
    base  = require('../../core/storage/container');

var Container = exports.Container = function Container(client, details) {
  base.Container.call(this, client, details);
};

util.inherits(Container, base.Container);

Container.prototype._setProperties = function (details) {
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
