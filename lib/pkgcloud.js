/*
 * pkgcloud.js: Top-level include for the pkgcloud module
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */

var pkgcloud = exports;

pkgcloud.common    = require('./pkgcloud/common');
pkgcloud.compute   = require('./pkgcloud/core/compute');
pkgcloud.storage   = require('./pkgcloud/core/storage');
pkgcloud.cdn       = require('./pkgcloud/core/cdn');
pkgcloud.providers = {};

//
// Setup core `pkgcloud.*.createClient` methods for all
// provider functionality.
//
['compute', 'storage', 'cdn'].forEach(function (service) {
  pkgcloud[method].createClient = function (options) {
    if (!options.provider) {
      throw new Error('options.provider is required to create a new pkgcloud client.')
    }

    var provider = pkgcloud[provider];

    if (!provider[service]) {
      throw new Error(options.provider + ' does not expose a' + service + ' service');
    }

    return new pkgcloud[provider][service].createClient(options);
  };
});

//
// Setup all providers as lazy-loaded getters
//
['amazon', 'rackspace', 'joyent'].forEach(function (provider) {
  pkgcloud.providers.__defineGetter__(provider, function () {
    return require('./pkgcloud/' + provider);
  })
});
