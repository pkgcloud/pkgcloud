/*
 * base-test.js: Test that should be common to all providers.
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var should = require('should'),
  helpers = require('../../helpers'),
  providers = require('../../configs/providers.json');

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].network;
}).forEach(function(provider) {
    describe('pkgcloud/common/network/base [' + provider + ']', function () {
      it('provider should implement networking client', function () {
        var networkClient = helpers.createClient(provider, 'network');
        should.exist(networkClient);
      });
    });
  });
