/*
* authentication-test.js: Tests for pkgcloud Rackspace storage authentication
*
* (C) 2010 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
*
*/

var should = require('should'),
    macros = require('../macros'),
    helpers = require('../../helpers'),
    http = require('http'),
    hock = require('hock'),
    mock = !!process.env.MOCK;

describe('pkgcloud/rackspace/storage/authentication', function () {
  describe('The pkgcloud Rackspace Storage client', function () {
    it('should have core methods defined', function() {
      var client = helpers.createClient('rackspace', 'storage');
      macros.shouldHaveCreds(client);
    });

    describe('the auth() method', function() {
      describe('with a valid user name and api key', function() {
        var authHockInstance, authServer;

        before(function(done) {
          if (!mock) {
            return done();
          }

          authHockInstance = hock.createHock();
          authServer = http.createServer(authHockInstance.handler);
          authServer.listen(12346, done);
        });

        it('should respond with 204 and appropriate info', function (done) {

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
          }

          var client = helpers.createClient('rackspace', 'storage');

          client.auth(function (err) {
            should.not.exist(err);
            authHockInstance && authHockInstance.done();
            done();
          });
        });

        it('should update the config with appropriate urls', function (done) {
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
          }

          var client = helpers.createClient('rackspace', 'storage');

          client.auth(function (err) {
            should.not.exist(err);
            authHockInstance && authHockInstance.done();
            done();
          });
        });

        after(function(done) {
          if (authHockInstance) {
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
        var authHockInstance, authServer;

        before(function (done) {
          if (!mock) {
            return done();
          }

          authHockInstance = hock.createHock();
          authServer = http.createServer(authHockInstance.handler);
          authServer.listen(12346, done);
        });

        it('should respond with 401 unauthorized', function (done) {

          if (mock) {
            authHockInstance
              .post('/v2.0/tokens', {
                auth: {
                  'RAX-KSKEY:apiKeyCredentials': {
                    username: 'fake',
                    apiKey: 'data'
                  }
                }
              })
              .reply(401, {
                unauthorized: {
                  message: 'Username or api key is invalid', code: 401
                }
              });
          }

          var badClient = helpers.createClient('rackspace', 'compute', {
            username: 'fake',
            apiKey: 'data',
            authUrl: 'localhost:12346',
            protocol: 'http://'
          });

          badClient.auth(function (err, res) {
            should.exist(err);
            should.not.exist(res);
            authHockInstance && authHockInstance.done();
            done();
          });
        });

        after(function (done) {
          if (authHockInstance) {
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
