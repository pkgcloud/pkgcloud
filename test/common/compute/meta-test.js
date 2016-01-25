/*
* meta-test.js: Openstack updateImageMeta() function test .
*
* (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
*
*/

var should = require('should'),
  helpers = require('../../helpers'),
  http = require('http'),
  hock = require('hock'),
  async = require('async'),
  Image = require('../../../lib/pkgcloud/core/compute/image').Image,
  mock = !!process.env.MOCK;

// Declaring variables for helper functions defined later
var setupMetaMock, setupImagesMock;

var providers=['openstack'];

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].compute;
}).forEach(function (provider) {
  describe('pkgcloud/common/compute/server [' + provider + ']', function () {

    var client = helpers.createClient(provider, 'compute'),
      context = {},
      authServer, server,
      authHockInstance,
      hockInstance;

    before(function (done) {

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

    it('the getImages() function should return a list of images', function(done) {

      if (mock) {
        setupImagesMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.getImages(function (err, images) {
        should.not.exist(err);
        should.exist(images);

        context.images = images;

        images.forEach(function(img) {
          img.should.be.instanceOf(Image);
        });

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();

        done();
      });
    });


    it('the updateImageMeta() method should update the image metadata', function (done) {
      if (mock) {
        setupMetaMock(client, provider, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      var testMetadata = {os_type: 'windows'};

      client.updateImageMeta(context.images[0].id, testMetadata, function (err, reply) {
        should.not.exist(err);
        should.exist(reply);
        should.exist(reply.metadata.os_type);
        reply.metadata.os_type.should.equal('windows');

        context.currentServer = server;

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();

      });
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
      ], done);
    });

  });
});

setupMetaMock = function (client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/images/506d077e-66bf-44ff-907a-588c5c79fa66/metadata',
      { metadata: {
        os_type :'windows'
      }})
      .replyWithFile(202, __dirname + '/../../fixtures/openstack/metaResponse.json');
  }
};

setupImagesMock = function (client, provider, servers) {
  if (provider === 'openstack') {
    servers.authServer
      .post('/v2.0/tokens', {
        auth: {
          passwordCredentials: {
            username: 'MOCK-USERNAME',
            password: 'MOCK-PASSWORD'
          }
        }
      })
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/initialToken.json')
      .get('/v2.0/tenants')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/tenantId.json')
      .post('/v2.0/tokens', {
        auth: {
          passwordCredentials: {
            username: 'MOCK-USERNAME',
            password: 'MOCK-PASSWORD'
          },
          tenantId: '72e90ecb69c44d0296072ea39e537041'
        }
      })
      .reply(200, helpers.getOpenstackAuthResponse());

    servers.server
      .get('/v2/72e90ecb69c44d0296072ea39e537041/images/detail')
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/images.json');
  }
};
