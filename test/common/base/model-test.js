/*
* client-test.js: Tests for pkgcloud base client
*
* (C) 2012 Nodejitsu Inc.
*
*/

var should = require('should'),
    Client = new require('../../../lib/pkgcloud/core/base/client').Client,
    _ = require('underscore'),
    helpers = require('../../helpers'),
    providers = require('../../configs/providers.json'),
    Model = require('../../../lib/pkgcloud/core/base/model').Model,
    utile = require('utile'),
    services = [
      'network',
      'compute',
      'cdn',
      'database',
      'dns',
      'loadbalancer',
      'blockstorage',
      'storage'
    ];

providers.forEach(function (provider) {
  describe('pkgcloud/core/base/model5 [' + provider + ']', function () {
    services.filter(function (service) {
      return !!helpers.pkgcloud.providers[provider][service];
    }).forEach(function(service){
      it (' provider [' + provider + '] service [' + service + ']',function () {
        var exportedTypes = require('../../../lib/pkgcloud/' + provider + '/' + service);
        for (var exportedTypeName in exportedTypes) {
          var exportedType = exportedTypes[exportedTypeName];
          if (exportedType.prototype._setProperties) {
             should.exist(exportedType.toJSON, 'expected method toJSON() on ' +
             'model type [' + exportedTypeName + '] in provider [' + provider +
              ']' + ', service [' + service + ']');
          }
        }
      });
    });
  });
});
