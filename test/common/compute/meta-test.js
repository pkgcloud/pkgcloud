/*
* meta-test.js: Openstack updateImageMeta() function test .
*
* (C) 2012 Nodejitsu Inc.
*
*/

var fs = require('fs'),
    path = require('path'),
    qs = require('qs'),
    should = require('should'),
    utile = require('utile'),
    async = require('async'),
    helpers = require('../../helpers'),
    hock = require('hock'),
    async = require('async'),
    _ = require('underscore'),
    Image = require('../../../lib/pkgcloud/core/compute/image').Image,
    mock = !!process.env.MOCK;

providers=["openstack"];


providers.forEach(function (provider) {
  describe('pkgcloud/common/compute/server [' + provider + ']', function () {

    var client = helpers.createClient(provider, 'compute'),
      context = {},
      authServer, server;

    before(function (done) {

      if (!mock) {
        return done();
      }

      async.parallel([
        function (next) {
          hock.createHock({
            port: 12345,
            throwOnUnmatched: false
          }, function (err, hockClient) {
            server = hockClient;
            next();
          });
        },
        function (next) {
          hock.createHock(12346, function (err, hockClient) {
            authServer = hockClient;
            next();
          });
        }
      ], done)
    });

    it('the getImages() function should return a list of images', function(done) {

      if (mock) {
        setupImagesMock(client, provider, {
          authServer: authServer,
          server: server
        });
      }

      client.getImages(function (err, images) {
        should.not.exist(err);
        should.exist(images);

        context.images = images

	images.forEach(function(img) {
          img.should.be.instanceOf(Image);
        });


        authServer && authServer.done();
        server && server.done();

        done();
      });
    });


    it('the updateImageMeta() method should update the image metadate', function (done) {
      if (mock) {
        setupMetaMock(client, provider, {
          authServer: authServer,
          server: server
        });
      }

      client.updateImageMeta(context.images[0].id, {"os_type" : "windows"}, function (err, img) {
        should.not.exist(err);
        should.exist(img);

        context.currentServer = server;

        authServer && authServer.done();
        server && server.done();
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
      ], done)
    });

  });
});

function setupMetaMock(client, provider, servers) {
  if (provider === 'openstack') {
    servers.server
      .post('/v2/72e90ecb69c44d0296072ea39e537041/images/506d077e-66bf-44ff-907a-588c5c79fa66/metadata',{"metadata":{"os_type" : "windows"}})
      .replyWithFile(202, __dirname + '/../../fixtures/openstack/metaResponse.json');
  }
}


function setupImagesMock(client, provider, servers) {
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
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/images.json')
    }
  
}


/**
 * serverStatusReply()
 * fills in the nock xml reply from the server with server name and status
 * @param name - name of the server
 * @param status - status to be returned in reply
 *  status should be:
 *      ReadyRole - server is RUNNING
 *      VMStopped - server is still PROVISIONING
 *      Provisioning - server is still PROVISIONING
 *      see lib/pkgcloud/azure/compute/server.js for more status values
 *
 * @return {String} - the xml reply containing the server name and status
 */
var serverStatusReply = function (name, status) {

  var template = helpers.loadFixture('azure/server-status-template.xml'),
    params = {NAME: name, STATUS: status};

  var result = _.template(template, params);
  return result;
};

var filterPath = function (path) {
  var name = PATH.basename(path);
  if (path.search('embed-detail=true') !== -1) {
    return '/getStatus?name=' + name;
  }

  return path;
};
