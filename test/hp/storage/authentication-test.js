/*
* authentication-test.js: Tests for pkgcloud hp storage authentication
*
* (C) 2014 HP.
*
*/

var should = require('should'),
    macros = require('../macros'),
    helpers = require('../../helpers'),
    async = require('async'),
    hock = require('hock'),
    mock = !!process.env.MOCK;

describe('pkgcloud/hp/storage/authentication', function () {
  describe('The pkgcloud hp Storage client', function () {
    it('should have core methods defined', function() {
      var client = helpers.createClient('hp', 'storage');
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
              .post('/v2.0/tokens', {
                auth: {
                  'apiAccessKeyCredentials': {
                    accessKey: 'MOCK-USERNAME',
                    secretKey: 'MOCK-API-KEY'
                  }
                }
              })
              .reply(200, helpers.gethpAuthResponse());
          }

          var client = helpers.createClient('hp', 'storage');

          client.auth(function (err) {
            should.not.exist(err);
            authServer && authServer.done();
            done();
          });
        });

        it('should update the config with appropriate urls', function (done) {
          if (mock) {
            authServer
              .post('/v2.0/tokens', {
                auth: {
                  'apiAccessKeyCredentials': {
                    accessKey: 'MOCK-USERNAME',
                    secretKey: 'MOCK-API-KEY'
                  }
                }
              })
              .reply(200, helpers.gethpAuthResponse());
          }

          var client = helpers.createClient('hp', 'storage');

          client.auth(function (err) {
            should.not.exist(err);
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
              .post('/v2.0/tokens', {
                auth: {
                  'apiAccessKeyCredentials': {
                    accessKey: 'fake',
                    secretKey: 'data'
                  }
                }
              })
              .reply(401, {
                unauthorized: {
                  message: 'accessKey or api key is invalid', code: 401
                }
              });
          }

          var badClient = helpers.createClient('hp', 'compute', {
            username: 'fake',
            apiKey: 'data',
            authUrl: 'localhost:12346',
            protocol: 'http://',
            region: 'region-a.geo-1'
          });

          badClient.auth(function (err, res) {
            should.exist(err);
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
