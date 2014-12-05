/*
 * signature-test.js: Test that shared methods meet some expectations for arguments.
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var should = require('should'),
    providers = require('../../configs/providers.json'),
    helpers = require('../../helpers');

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].network;
}).forEach(function (provider) {

  describe('pkgcloud/common/network/signatures [' + provider + ']', function () {

    var client = helpers.createClient(provider, 'network');

    it('client.getNetworks should take 2 arguments', function () {
      client.getNetworks.should.be.a.Function;
      client.getNetworks.should.have.length(2);
    });

    it('client.getNetwork should take 2 arguments', function () {
      client.getNetwork.should.be.a.Function;
      client.getNetwork.should.have.length(2);
    });

    it('client.getNetworks should take at least 1 argument', function () {
      client.getNetworks.should.be.a.Function;
      should.ok(client.getNetworks.length >= 1);
    });

    it('client.createNetwork should take 2 arguments', function () {
      client.createNetwork.should.be.a.Function;
      client.createNetwork.should.have.length(2);
    });

  });
});
