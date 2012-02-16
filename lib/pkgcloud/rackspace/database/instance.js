/*
 * instances.js: Rackspace Cloud Database Instance
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
    model = require('../../core/base/model'),
    Flavor = require('./flavor');

var Instance = exports.Instance = function (client, details) {
  model.Model.call(this, client, details);
};

utile.inherits(Instance, model.Model);

Instance.prototype.refresh = function (callback) {
  this.client.getInstance(this, callback);
};

Instance.prototype._setProperties = function (details) {
  this.id = details.id;
  this.name = details.name;
  this.created = details.created;
  this.updated = details.updated;
  this.size = details.volume.size;
  this.links = details.links;
  this.flavor = details.flavor;
  this.status = details.status;
};

