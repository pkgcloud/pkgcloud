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
  this.links = details.links;

  // Fix for name in rackspace
  details.state = (details.status) ? details.status : details.state

  if (details.state) {
    switch (details.state.toUpperCase()) {
      case 'PROVISIONING':
      case 'BUILD':
        this.status = "PROVISIONING";
        break;
      case 'RUNNING':
      case 'ACTIVE': // Change for keep consistency
        this.status = "RUNNING";
        break;
      case 'STOPPING':
      case 'STOPPED':
        this.status = "STOPPED";
        break;
      case 'FAILED':
        this.status = 'FAILED';
        break;
      default:
        this.status = "UNKNOWN";
        break;
    }
  }

  if (details.created) this.created = details.created;
  if (details.updated) this.updated = details.updated;
  if (details.flavor) this.flavor = details.flavor;
  if (details.hostname) this.hostname = details.hostname;
  if (details.volume) this.volume = details.volume;
};