/*
 * base-test.js: Test that should be common to all providers.
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var fs = require('fs'),
  path = require('path'),
  should = require('should'),
  qs = require('qs'),
  utile = require('utile'),
  async = require('async'),
  helpers = require('../../helpers'),
  hock = require('hock'),
  _ = require('underscore'),
  providers = require('../../configs/providers.json'),
  versions = require('../../fixtures/versions.json'),
  Flavor = require('../../../lib/pkgcloud/core/compute/flavor').Flavor,
  Image = require('../../../lib/pkgcloud/core/compute/image').Image,
  Server = require('../../../lib/pkgcloud/core/compute/server').Server,
  azureApi = require('../../../lib/pkgcloud/azure/utils/azureApi'),
  pkgcloud = require('../../../lib/pkgcloud'),
  mock = !!process.env.MOCK;

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].networking;
}).forEach(function(provider) {
    describe('pkgcloud/common/compute/base [' + provider + ']', function () {
      it('provider should implement networking client', function () {
        var networkingClient = helpers.createClient(provider, 'networking');
        should.exist(networkingClient);
      });
    });
  });
