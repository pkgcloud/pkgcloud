/*
 * instances.js: Instance methods for working with database instances from Rackspace Cloud
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var Flavor = require('../flavor').Flavor,
    Instance = require('../instance').Instance;

// Create Database Instance
// Need a flavor
exports.createInstance = function (options, callback) {
  var self = this,
      flavorRef,
      size;

  ['flavor'].forEach(function (required) {
    if (!options[required]) throw new Error('options. ' + required + ' is a required argument');
  });

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
    var instance = new Instance(self, JSON.parse(body).instance);
    callback(null, instance);
  });
};
