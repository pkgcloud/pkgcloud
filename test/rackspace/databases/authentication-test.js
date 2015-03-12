
/*
 * authentication-test.js: Tests for pkgcloud Rackspace compute authentication
 *
 * (C) 2010 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var should = require('should'),
    macros = require('../macros'),
    async = require('async'),
    hock = require('hock'),
    http = require('http'),
    helpers = require('../../helpers'),
    mock = process.env.MOCK;

describe('pkgcloud/rackspace/database/authentication', function() {
  var client, authHockInstance, hockInstance, authServer, server;

  before(function(done) {
    client = helpers.createClient('rackspace', 'database');

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

  describe('The pkgcloud Rackspace Database client', function() {
    it('should have core methods defined', function() {
      macros.shouldHaveCreds(client);
    });

    it('the getVersion() method should return the proper version', function(done) {
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
          .get('/')
          .reply(200, {
            versions: [
              {
                status: 'CURRENT',
                updated: '2012-08-01T00:00:00Z',
                id: 'v1.0',
                links: [
                  {
                    href: 'http://dfw.databases.api.rackspacecloud.com/v1.0/',
                    rel: 'self'
                  }
                ]
              }
            ]
          });
      }

      client.getVersion(function (err, versions) {
        should.not.exist(err);
        should.exist(versions);
        versions.should.be.an.Array;
        versions.should.have.length(1);

        hockInstance && hockInstance.done();
        authHockInstance && authHockInstance.done();
        done();
      });
    });

    describe('the auth() method with a valid username and api key', function() {

      var client = helpers.createClient('rackspace', 'database'),
          err;

      beforeEach(function(done) {

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

        client.auth(function (e) {
          err = e;
          authHockInstance && authHockInstance.done();
          done();
        });

      });

      it('should respond with 200 and appropriate info', function() {
        should.not.exist(err);
      });

      it('should respond with a token', function () {
        should.exist(client._identity.token);
      });

      it('should update the config with appropriate urls', function () {
        should.exist(client._identity);
      });

      afterEach(function() {
        delete client._identity.token;
      });
    });

    describe('the auth() method with an invalid username and api key', function () {

      var badClient = helpers.createClient('rackspace', 'database', {
        username: 'fake',
        apiKey: 'data',
        protocol: 'http://',
        authUrl: 'localhost:12346'
      });

      var err;

      beforeEach(function (done) {

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

        badClient.auth(function (e) {
          err = e;
          authHockInstance && authHockInstance.done();
          done();
        });
      });

      it('should respond with Error code 401', function () {
        should.exist(err);
        // TODO resolve identity responses
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
