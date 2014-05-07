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
  pkgcloud = require('../../../lib/pkgcloud'),
  mock = !!process.env.MOCK;

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].network;
}).forEach(function(provider) {
    describe.only('pkgcloud/common/network/base [' + provider + ']', function () {
      it('provider should implement networking client', function () {
        var networkClient = helpers.createClient(provider, 'network');
        should.exist(networkClient);
      });
    });
  });
