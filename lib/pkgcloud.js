/*
 * pkgcloud.js: Top-level include for the pkgcloud module
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var path = require('path');

var pkgcloud = exports;

var components = [
  './pkgcloud/core/base', 
  './pkgcloud/common', 
  './pkgcloud/core/compute', 
  './pkgcloud/core/storage'
];

//
// Setup lazy-loaded exports for faster loading
//
components.forEach(function (component) {
  var name = path.basename(component),
      hidden = '_' + name;
      
  pkgcloud.__defineGetter__(name, function () {
    if (!pkgcloud[hidden]) {
      pkgcloud[hidden] = require(component);
    }
    
    return pkgcloud[hidden];
  });
});

//
// Setup empty exports to be populated later
//
['storage', 'cdn', 'providers', 'database'].forEach(function (key) {
  pkgcloud[key] = {};
});

//
// Setup core `pkgcloud.*.createClient` methods for all
// provider functionality.
//
['compute', 'storage', 'cdn', 'database'].forEach(function (service) {
  pkgcloud[service].createClient = function (options) {
    if (!options.provider) {
      throw new Error('options.provider is required to create a new pkgcloud client.');
    }

    var provider = pkgcloud.providers[options.provider];

    if (!provider[service]) {
      throw new Error(options.provider + ' does not expose a ' + service + ' service');
    }

    return new provider[service].createClient(options);
  };
});

//
// Setup all providers as lazy-loaded getters
//
['azure','amazon', 'rackspace',
 'joyent', 'mongolab', 'iriscouch',
 'mongohq', 'redistogo', 'openstack'].forEach(function (provider) {
  pkgcloud.providers.__defineGetter__(provider, function () {
    return require('./pkgcloud/' + provider);
  });
});
