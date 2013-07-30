/*
 * volumes-test.js: OpenStack BlockStorage volume tests
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */
var fs = require('fs'),
    path = require('path'),
    should = require('should'),
    async = require('async'),
    hock = require('hock'),
    helpers = require('../../helpers'),
    Volume = require('../../../lib/pkgcloud/rackspace/blockstorage/volume').Volume,
    mock = !!process.env.MOCK;

describe('pkgcloud/rackspace/blockstorage/volumes', function () {
  var client,
      testContext = {}, authServer, server;

  before(function (done) {
    client = helpers.createClient('rackspace', 'blockstorage');

    if (!mock) {
      return done();
    }

    async.parallel([
      function (next) {
        hock.createHock(12346, function (err, hockClient) {
          should.not.exist(err);
          should.exist(hockClient);

          authServer = hockClient;
          next();
        });
      },
      function (next) {
        hock.createHock(12345, function (err, hockClient) {
          should.not.exist(err);
          should.exist(hockClient);

          server = hockClient;
          next();
        });
      }
    ], done);
  });

  describe('The pkgcloud Rackspace BlockStorage client', function () {

    it('should get an empty list of volumes', function(done) {
      if (mock) {
        authServer
          .post('/v2.0/tokens', {
            auth: {
              'RAX-KSKEY:apiKeyCredentials': {
                username: 'MOCK-USERNAME',
                apiKey: 'MOCK-API-KEY'
              }
            }
          })
          .reply(200, helpers.getRackspaceAuthResponse());

        server
          .get('/v1/123456/volumes')
          .reply(200, { volumes: [] });
      }

      client.getVolumes(function (err, volumes) {
        should.not.exist(err);
        should.exist(volumes);
        volumes.should.be.instanceOf(Array);
        volumes.length.should.equal(0);
        authServer && authServer.done();
        server && server.done();
        done();
      });

    });

    it('should create a new volume', function (done) {
      if (mock) {
        server
          .post('/v1/123456/volumes', {
            volume: {
              display_name: 'foo3',
              display_description: 'my volume',
              size: 100
            }
          })
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/createVolume.json');
      }

      client.createVolume({
        name: 'foo3',
        description: 'my volume',
        size: 100
      }, function (err, volume) {
        should.not.exist(err);
        should.exist(volume);
        volume.should.be.instanceOf(Volume);
        volume.name.should.equal('foo3');
        authServer && authServer.done();
        server && server.done();
        done();
      });

    });

    it('should get a list of volumes', function (done) {
      if (mock) {
        server
          .get('/v1/123456/volumes')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/volumes.json');
      }

      client.getVolumes(function (err, volumes) {
        should.not.exist(err);
        should.exist(volumes);
        volumes.should.be.instanceOf(Array);
        volumes.forEach(function(volume) {
          volume.should.be.instanceOf(Volume);
        });
        authServer && authServer.done();
        server && server.done();
        done();
      });
    });
//
//    it('the createImage() method with a serverId should create a new image', function (done) {
//      if (mock) {
//        server
//          .post('/v2/123456/servers/a0a5f183-b94e-4a41-a854-00aa00aa00aa/action', {
//            createImage: { name: 'test-img-id' }
//          })
//          .reply(202, helpers.loadFixture('rackspace/queued_image.json'), {
//            location: 'http://localhost:12345/v2/123456/images/a52cce1f-73fa-49ed-8382-0ab1c9caa322'
//          })
//          .get('/v2/123456/images/a52cce1f-73fa-49ed-8382-0ab1c9caa322')
//          .reply(200, helpers.loadFixture('rackspace/image.json'));
//
//      }
//
//      client.createImage({ name: 'test-img-id',
//        server: testContext.servers[0].id
//      }, function (err, image) {
//        should.not.exist(err);
//        should.exist(image);
//        testContext.image = image;
//        server && server.done();
//        done();
//      });
//    });
//
//    after(function (done) {
//
//      if (mock) {
//        server
//          .delete('/v2/123456/volumes/a52cce1f-73fa-49ed-8382-0ab1c9caa322')
//          .reply(204, '', {});
//      }
//
//      client.destroyImage(testContext.image, function (err) {
//        should.not.exist(err);
//        server && server.done();
//        done();
//      });
//    });
  });

  after(function (done) {
    if (!mock) {
      return done();
    }

    async.parallel([
      function (next) {
        authServer.close(next);
      },
      function (next) {
        server.close(next);
      }
    ], done)
  });
});