/*
 * entity.js: Rackspace Cloud Monitoring Entity
 *
 * (C) 2014 Rackspace
 *      Justin Gallardo
 * MIT LICENSE
 *
 */

var utile = require('utile'),
    model = require('../../core/base/model'),
    _ = require('underscore');


var Entity = exports.Entity = function Entity(client, details) {
  model.Model.call(this, client, details);
};

utile.inherits(Entity, model.Model);

Entity.prototype.create = function (callback) {
  return this.client.createEntity(this, callback);
};

Entity.prototype.get = function (callback) {
  return this.client.getEntity(this, callback);
};

Entity.prototype.update = function (callback) {
  return this.client.updateEntity(this, callback);
};

Entity.prototype.destroy = function (callback) {
  return this.client.deleteEntity(this, callback);
};

Entity.prototype._setProperties = function (details) {
  var self = this;

  self.id = details.id;
  self.label = details.label;
  self.ip_addresses = details.ip_addresses;
  self.metadata = details.metadata;
  self.managed = details.managed;
  self.uri = details.uri;
  self.agent_id = details.agent_id;
  self.created_at = details.created_at;
  self.updated_at = details.updated_at;
};

Entity.prototype.toJSON = function () {
  return _.pick(this, ['id', 'label', 'ip_addresses', 'metadata', 'managed',
    'uri', 'agent_id', 'created_at', 'updated_at']);
};
