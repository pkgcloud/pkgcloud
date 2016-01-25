/*
* image-test.js: Tests for pkgcloud Rackspace compute image requests
*
* (C) 2010-2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
* MIT LICENSE
*
*/

var should = require('should'),
    async = require('async'),
    hock = require('hock'),
    http = require('http'),
    helpers = require('../../helpers'),
    mock = !!process.env.MOCK;

describe('pkgcloud/rackspace/compute/images', function () {
  var client,
      testContext = {}, authHockInstance, hockInstance, authServer, server;

  before(function (done) {
    client = helpers.createClient('rackspace', 'compute');

    if (!mock) {
      return done();
    }

    hockInstance = hock.createHock({ throwOnUnmatched: false });
    authHockInstance = hock.createHock();

    server = http.createServer(hockInstance.handler);
    authServer = http.createServer(authHockInstance.handler);

    async.parallel([
      function (next) {
        server.listen(12345, next);
      },
      function (next) {
        authServer.listen(12346, next);
      }
    ], done);
  });

  describe('The pkgcloud Rackspace Compute client', function () {
    before(function(done) {
      if (mock) {
        authHockInstance
          .post('/v2.0/tokens', {
            auth: {
              'RAX-KSKEY:apiKeyCredentials': {
                username: 'MOCK-USERNAME',
                apiKey: 'MOCK-API-KEY'
              }
            }
          })
          .reply(200, helpers.getRackspaceAuthResponse());

        hockInstance
          .get('/v2/123456/servers/detail')
          .reply(200, helpers.loadFixture('rackspace/servers.json'));
      }

      client.getServers(function(err, servers) {
        should.not.exist(err);
        should.exist(servers);
        servers.should.be.an.Array;
        testContext.servers = servers;
        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the createImage() method with a serverId should create a new image', function(done) {
      if (mock) {
        hockInstance
          .post('/v2/123456/servers/a0a5f183-b94e-4a41-a854-00aa00aa00aa/action', {
            createImage: { name: 'test-img-id' }
          })
          .reply(202, helpers.loadFixture('rackspace/queued_image.json'), {
            location: 'http://localhost:12345/v2/123456/images/a52cce1f-73fa-49ed-8382-0ab1c9caa322'
          })
          .get('/v2/123456/images/a52cce1f-73fa-49ed-8382-0ab1c9caa322')
          .reply(200, helpers.loadFixture('rackspace/image.json'));

      }

      client.createImage({ name: 'test-img-id',
        server: testContext.servers[0].id
      }, function(err, image) {
        should.not.exist(err);
        should.exist(image);
        testContext.image = image;
        hockInstance && hockInstance.done();
        done();
      });
    });

    after(function(done) {

      if (mock) {
        hockInstance
          .delete('/v2/123456/images/a52cce1f-73fa-49ed-8382-0ab1c9caa322')
          .reply(204, '', {});
      }

      client.destroyImage(testContext.image, function(err) {
        should.not.exist(err);
        hockInstance && hockInstance.done();
        done();
      });
    });
  });

  after(function (done) {
    if (!mock) {
      return done();
    }

    async.parallel([
      function (next) {
        server.close(next);
      },
      function (next) {
        authServer.close(next);
      }
    ], done);
  });
});
