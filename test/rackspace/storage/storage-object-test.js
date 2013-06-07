/*
 * storage-object-test.js: Tests for Rackspace Cloudfiles containers
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
  File = require('../../../lib/pkgcloud/core/storage/file').File,
  mock = !!process.env.MOCK;

if (!mock) {
  return; // these tests are disabled when running for real
}

describe('pkgcloud/rackspace/storage/stroage-object', function () {
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

    it('getFiles should return a list of files', function (done) {

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
          .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.7-215?format=json')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/getFiles.json');
      }

      client.getFiles('0.1.7-215', function (err, files) {
        should.not.exist(err);
        should.exist(files);
        files.should.have.length(5);
        files.forEach(function (f) {
          f.should.be.instanceof(File);
        });
        authServer && authServer.done();
        server && server.done();
        done();
      });
    });

    it('getFiles with limit should return reduced set', function (done) {

      if (mock) {
        server
          .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.7-215?format=json&limit=3')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/getContainersLimit.json');
      }

      client.getFiles('0.1.7-215', { limit: 3 }, function (err, files) {
        should.not.exist(err);
        should.exist(files);
        files.should.have.length(3);
        files.forEach(function (f) {
          f.should.be.instanceof(File);
        });
        server && server.done();
        done();
      });
    });

    it('getFiles with limit should return reduced set', function (done) {

      if (mock) {
        server
          .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.7-215?format=json&limit=3')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/getFilesLimit.json');
      }

      client.getFiles('0.1.7-215', { limit: 3 }, function (err, files) {
        should.not.exist(err);
        should.exist(files);
        files.should.have.length(3);
        files.forEach(function (f) {
          f.should.be.instanceof(File);
        });
        server && server.done();
        done();
      });
    });


    it('getFiles with marker should start offset appropriately', function (done) {

      if (mock) {
        server
          .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.7-215?format=json&marker=ubuntu-10.04-x86_64%2Fconf%2Fdistributions')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/getFilesMarker.json');
      }

      client.getFiles('0.1.7-215', { marker: 'ubuntu-10.04-x86_64/conf/distributions' }, function (err, files) {
        should.not.exist(err);
        should.exist(files);
        files.should.have.length(1);
        files.forEach(function (f) {
          f.should.be.instanceof(File);
        });
        server && server.done();
        done();
      });
    });

    it('getFiles with marker and limit should start offset appropriatley', function (done) {

      if (mock) {
        server
          .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.7-215?format=json&limit=4&marker=CHANGELOG')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/getFilesLimitMarker.json');
      }

      client.getFiles('0.1.7-215', { limit: 4, marker: 'CHANGELOG' }, function (err, files) {
        should.not.exist(err);
        should.exist(files);
        files.should.have.length(4);
        files.forEach(function (f) {
          f.should.be.instanceof(File);
        });
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

