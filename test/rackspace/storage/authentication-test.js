/*
* authentication-test.js: Tests for pkgcloud Rackspace storage authentication
*
* (C) 2010 Nodejitsu Inc.
*
*/

var should = require('should'),
    macros = require('../macros'),
    helpers = require('../../helpers'),
    async = require('async'),
    nock = require('nock'),
    hock = require('hock'),
    mock = !!process.env.NOCK;

describe('pkgcloud/rackspace/storage/authentication', function () {
  describe('The pkgcloud Rackspace Storage client', function () {
    it('should have core methods defined', function() {
      var client = helpers.createClient('rackspace', 'storage');
      macros.shouldHaveCreds(client);
    });

    describe('the auth() method', function() {
      describe('with a valid user name and api key', function() {
        var authServer;

        before(function(done) {
          if (!mock) {
            return done();
          }

          hock.createHock(12346, function (err, hockClient) {
            authServer = hockClient;
            done();
          });
        });

        it('should respond with 204 and appropriate info', function (done) {

          if (mock) {
            authServer
              .get('/v1.0')
              .reply(204, '', helpers.loadFixture('rackspace/auth.json', 'json'));
          }

          var client = helpers.createClient('rackspace', 'storage');

          client.auth(function (err, res) {
            should.not.exist(err);
            should.exist(res);
            res.statusCode.should.equal(204);
            res.headers.should.be.a('object');
            authServer && authServer.done();
            done();
          });
        });

        it('should update the config with appropriate urls', function (done) {
          if (mock) {
            authServer
              .get('/v1.0')
              .reply(204, '', helpers.loadFixture('rackspace/auth.json', 'json'));
          }

          var client = helpers.createClient('rackspace', 'storage');

          client.auth(function (err, res) {
            should.not.exist(err);
            should.exist(res);
            client.config.serverUrl.should.equal(res.headers['x-server-management-url']);
            client.config.storageUrl.should.equal(res.headers['x-storage-url']);
            client.config.cdnUrl.should.equal(res.headers['x-cdn-management-url']);
            client.config.authToken.should.equal(res.headers['x-auth-token']);
            authServer && authServer.done();
            done();
          });
        });

        after(function(done) {
          if (authServer) {
            authServer.close(function () {
              done();
            });
          }
          else {
            done();
          }
        });
      });

      describe('with an invalid user name and api key shouldn\'t authenticate', function () {
        var authServer;

        before(function (done) {
          if (!mock) {
            return done();
          }

          hock.createHock(12346, function (err, hockClient) {
            authServer = hockClient;
            done();
          });
        });

        it('should respond with 401 unauthorized', function (done) {

          if (mock) {
            authServer
              .get('/v1.0')
              .reply(401);
          }

          var client = helpers.createClient('rackspace', 'storage');

          client.auth(function (err, res) {
            should.not.exist(err);
            should.exist(res);
            res.statusCode.should.equal(401);
            authServer && authServer.done();
            done();
          });
        });

        after(function (done) {
          if (authServer) {
            authServer.close(function () {
              done();
            });
          }
          else {
            done();
          }
        });
      });
    });
  });
});
