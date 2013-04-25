/*
* image-test.js: Tests for pkgcloud Rackspace compute image requests
*
* (C) 2010-2012 Nodejitsu Inc.
* MIT LICENSE
*
*/

var fs = require('fs'),
    path = require('path'),
    should = require('should'),
    nock = require('nock'),
    helpers = require('../../helpers'),
    mock = !!process.env.NOCK;

describe('pkgcloud/rackspace/compute/images', function () {
  var client = helpers.createClient('rackspace', 'compute'),
      testContext = {};

  describe('The pkgcloud Rackspace Compute client', function () {
    before(function(done) {

      if (mock) {
        nock('https://' + client.authUrl)
          .get('/v1.0')
          .reply(204, '', JSON.parse(helpers.loadFixture('rackspace/auth.json')));

        nock('https://' + client.serversUrl)
          .get('/v1.0/537645/servers/detail.json')
          .reply(204, helpers.loadFixture('rackspace/servers.json'), {});
      }

      client.getServers(function(err, servers) {
        should.not.exist(err);
        should.exist(servers);
        servers.should.be.instanceOf(Array);
        testContext.servers = servers;
        done();
      });
    });

    it('the createImage() method with a serverId should create a new image', function(done) {
      if (mock) {
        nock('https://' + client.serversUrl)
          .post('/v1.0/537645/images', { image: { name: 'test-img-id', serverId: 20578901 } })
          .reply(202, helpers.loadFixture('rackspace/queued_image.json'), {});
      }

      client.createImage({ name: 'test-img-id',
        server: testContext.servers[0].id
      }, function(err, image) {
        should.not.exist(err);
        should.exist(image);
        testContext.image = image;
        done();
      });
    });
    
    after(function(done) {

      if (mock) {
        nock('https://' + client.serversUrl)
          .delete('/v1.0/537645/images/18753753')
          .reply(204, '', {});
      }

      client.destroyImage(testContext.image, function(err) {
        should.not.exist(err);
        done();
      });
    });
  });
});