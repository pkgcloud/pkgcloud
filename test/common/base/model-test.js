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
    ],
    modelTypes = [];

modelTypes = helpers.getModelTypes();
modelTypes.forEach( function (modelType) {
  describe('pkgcloud/core/base/models8 [' + modelType.provider + '] service ['+ modelType.service +'] model [' + modelType.modelName + ']', function () {
   it( 'model [' + modelType.modelName + '] has a toJSON method', function () {
     should.exist(modelType.modelType.prototype.toJSON);
   });
 });
});
