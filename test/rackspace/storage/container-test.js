/*
* container-test.js: Tests for Rackspace Cloudfiles containers
*
* (C) 2010 Nodejitsu Inc.
* MIT LICENSE
*
*/

var path = require('path'),
    fs = require('fs'),
    should = require('should'),
    pkgcloud = require('../../../lib/pkgcloud'),
    helpers = require('../../helpers'),
    async = require('async'),
    hock = require('hock'),
    Container = require('../../../lib/pkgcloud/core/storage/container').Container,
    mock = !!process.env.MOCK;

if (!mock) {
  return; // these tests are disabled when running for real
}

describe('pkgcloud/rackspace/storage/containers', function () {
  describe('The pkgcloud Rackspace Storage client', function () {

    var client, server, authServer;

    before(function (done) {
      client = helpers.createClient('rackspace', 'storage');

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

    it('getContainers should return a list of containers', function (done) {

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
          .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00?format=json')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/getContainers.json');
      }

      client.getContainers(function(err, containers) {
        should.not.exist(err);
        should.exist(containers);
        containers.should.have.length(5);
        containers.forEach(function(c) {
          c.should.be.instanceof(Container);
        });
        authServer && authServer.done();
        server && server.done();
        done();
      });
    });

    it('getContainers with limit should return reduced set', function (done) {

      if (mock) {
        server
          .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00?format=json&limit=3')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/getContainersLimit.json');
      }

      client.getContainers({ limit: 3 }, function (err, containers) {
        should.not.exist(err);
        should.exist(containers);
        containers.should.have.length(3);
        containers.forEach(function (c) {
          c.should.be.instanceof(Container);
        });
        server && server.done();
        done();
      });
    });

    it('getContainers with limit should return reduced set', function (done) {

      if (mock) {
        server
          .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00?format=json&limit=3')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/getContainersLimit.json');
      }

      client.getContainers({ limit: 3 }, function (err, containers) {
        should.not.exist(err);
        should.exist(containers);
        containers.should.have.length(3);
        containers.forEach(function (c) {
          c.should.be.instanceof(Container);
        });
        server && server.done();
        done();
      });
    });

    it('getContainers with marker should start offset appropriately', function (done) {

      if (mock) {
        server
          .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00?format=json&marker=0.1.3-90')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/getContainersMarker.json');
      }

      client.getContainers({ marker: '0.1.3-90' }, function (err, containers) {
        should.not.exist(err);
        should.exist(containers);
        containers.should.have.length(1);
        containers.forEach(function (c) {
          c.should.be.instanceof(Container);
        });
        server && server.done();
        done();
      });
    });

    it('getContainers with marker and limit should start offset appropriatley', function (done) {

      if (mock) {
        server
          .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00?format=json&limit=4&marker=0.1.3-85')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/getContainersLimitMarker.json');
      }

      client.getContainers({ limit: 4, marker: '0.1.3-85' }, function (err, containers) {
        should.not.exist(err);
        should.exist(containers);
        containers.should.have.length(4);
        containers.forEach(function (c) {
          c.should.be.instanceof(Container);
        });
        server && server.done();
        done();
      });
    });

    it('updateContainerMetadata should throw if passed non container', function() {
      (function() {
        client.updateContainerMetadata({ name: 'foo' })
      }).should.throw();
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

