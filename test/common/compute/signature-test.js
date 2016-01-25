/*
 * signature-test.js: Test that shared methods meet some expectations for arguments.
 *
 * (C) 2013 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var should = require('should'),
    providers = require('../../configs/providers.json'),
    helpers = require('../../helpers');

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].compute;
}).forEach(function (provider) {

  describe('pkgcloud/common/compute/signatures [' + provider + ']', function () {

    var client = helpers.createClient(provider, 'compute');

    it('client.getVersion should have length 1', function () {
      client.getVersion.should.be.a.Function;
      client.getVersion.should.have.length(1);
    });

    it('client.createServer should take 2 arguments', function () {
      client.createServer.should.be.a.Function;
      client.createServer.should.have.length(2);
    });

    it('client.getServers should take at least 1 argument', function () {
      client.getServers.should.be.a.Function;
      should.ok(client.getServers.length >= 1);
    });

    it('client.getServer should take 2 arguments', function () {
      client.getServer.should.be.a.Function;
      client.getServer.should.have.length(2);
    });

    it('client.rebootServer should have minimum 2 arguments', function () {
      client.rebootServer.should.be.a.Function;
      should.ok(client.rebootServer.length >= 2);
    });

    it('client.destroyServer should take at least 2 arguments', function () {
      client.destroyServer.should.be.a.Function;
      should.ok(client.destroyServer.length >= 2);
    });

    it('client.getFlavor should take 2 arguments', function () {
      client.getFlavor.should.be.a.Function;
      client.getFlavor.should.have.length(2);
    });

    it('client.getFlavors should take 1 argument', function () {
      client.getFlavors.should.be.a.Function;
      client.getFlavors.should.have.length(1);
    });

    it('client.getImage should take 2 arguments', function () {
      client.getImage.should.be.a.Function;
      client.getImage.should.have.length(2);
    });

    it('client.getImages should have minimum 1 argument', function () {
      client.getImages.should.be.a.Function;
      should.ok(client.getImages.length >= 1);
    });
  });
});

