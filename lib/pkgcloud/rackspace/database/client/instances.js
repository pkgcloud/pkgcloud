/*
 * instances.js: Instance methods for working with database instances from Rackspace Cloud
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var Flavor = require('../flavor').Flavor,
    Instance = require('../instance').Instance,
    errs = require('errs');

// Create Database Instance
// Need a flavor
exports.createInstance = function (options, callback) {
  var self = this,
      flavorRef,
      size;

  if (!options['flavor']) {
    return errs.handle(errs.create({
      message: 'options. flavor is a required argument'
    }), callback);
  }

  if (typeof options['databases'] === 'array' && options['databases'].length > 0) {
    options['databases'].forEach(function (item, idx) {
      if (typeof item === 'string') {
        options['databases'][idx] = {
          name: item,
          character_set: "utf8",
          collate: 'utf8_general_ci'
        }
      }
    });
  }

  size = (options['size'] > 0 && options['size'] < 9) ? options['size'] : 1;

  flavorRef = options['flavor'] instanceof Flavor ? options['flavor'].href : options['flavor'];

  var createOptions = {
    method: 'POST',
    path: 'instances',
    body: {
      instance: {
        name: options['name'],
        flavorRef: flavorRef,
        databases: options['databases'] || [],
        volume: { size: size }
      }
    }
  };

  this.request(createOptions, callback, function(body, response) {
    var instance = new Instance(self, body.instance);
    callback(null, instance);
  });
};

// Gets all instances info
exports.getInstances = function (details, callback) {
  var self = this;

  if (typeof details === 'function') {
    callback = details;
    details = false;
  }

  if (details) {
    return this.getInstancesDetails(callback);
  }

  this.request('instances', callback, function (body) {
    callback(null, body.instances.map(function (result) {
      return new Instance(self, result);
    }));
  });
};

// Gets all instances info with details
exports.getInstancesDetails = function (callback) {
  var self = this;
  this.request('instances/detail', callback, function (body) {
    callback(null, body.instances.map(function (result) {
      return new Instance(self, result);
    }));
  });
};

// Destroying the database instance
exports.destroyInstance = function (instance, callback) {
  var instanceId = instance instanceof Instance ? instance.id : instance;
  this.request('DELETE', 'instances/' + instanceId, callback, function (body, response) {
    callback(null, response);
  });
};

// Details of specific instance
exports.getInstance = function (instance, callback) {
  var self = this;
  var instanceId = instance instanceof Instance ? instance.id : instance;
  this.request('instances/' + instanceId, callback, function (body, response) {
    callback(null, body.instance);
  });
};
