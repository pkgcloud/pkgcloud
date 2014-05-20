/*
* authentication-test.js: Tests for pkgcloud hp network authentication
*
* (C) 2014 Hewlett-Packard Development Company, L.P.
*
*/

var should = require('should'),
    async = require('async'),
    hock = require('hock'),
    macros = require('../macros'),
    helpers = require('../../helpers'),
    mock = !!process.env.MOCK;

describe('pkgcloud/hp/network/authentication', function () {
  var client, authServer, server;

  describe('The pkgcloud hp network client', function () {

    before(function (done) {
      client = helpers.createClient('hp', 'network');

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

    it('should have core methods defined', function() {
      macros.shouldHaveCreds(client);
    });

    describe('the auth() method with a valid username and api key', function () {
      var err, res;

      beforeEach(function (done) {

        client = helpers.createClient('hp', 'compute');
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

        client.auth(function (e) {
          should.not.exist(e);
          authServer && authServer.done();
          done();
        });
      });

      it('should update the config with appropriate urls', function () {
        client._identity.should.be.a('object');
      });
    });

    describe('the auth() method with an invalid username and api key', function () {

      var badClient = helpers.createClient('hp', 'compute', {
        username: 'fake',
        apiKey: 'data',
        authUrl: 'localhost:12346',
        protocol: 'http://',
        region: 'custom region'
      });

      var err, res;

      beforeEach(function (done) {

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
                message: 'Username or api key is invalid', code: 401
              }
            });
        }

        badClient.auth(function (e) {
          err = e;
          authServer && authServer.done();
          done();
        });

      });

      it('should respond with Error code 401', function () {
        should.exist(err);
        // TODO resolve identity responses
      });
    });

    describe('auth tokens should expire', function () {
      var tokenExpiry;

      beforeEach(function (done) {

        client = helpers.createClient('hp', 'compute');

        client.on('log::*', function(message, obj) {
          if (this.event !== 'log::trace') {
            console.log(message);
            console.dir(obj);
          }
        });

        if (mock) {

          var response = helpers.gethpAuthResponse(new Date(new Date().getTime() + 1));

          tokenExpiry = response.access.token.expires;

          authServer
            .post('/v2.0/tokens', {
              auth: {
                'apiAccessKeyCredentials': {
                  accessKey: 'MOCK-USERNAME',
                  secretKey: 'MOCK-API-KEY'
                }
              }
            })
            .reply(200, response);
        }

        client.auth(function (e) {
          should.not.exist(e);
          authServer && authServer.done();
          done();
        });
      });

      it('should update the config with appropriate urls', function () {
        client._identity.should.be.a('object');
        client._identity.token.expires.toString().should.equal(tokenExpiry);
      });

      it('should expire the token and set authorized to false', function(done) {
        setTimeout(function() {
          client._isAuthorized().should.equal(false);
          done();
        }, 5);
      });

      it('should expire the token and reauth on next call', function (done) {

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

          server
            .get('/v2/5ACED3DC3AA740ABAA41711243CC6949/images/detail')
            .replyWithFile(200, __dirname + '/../../fixtures/hp/images.json');
        }

        setTimeout(function () {
          client._isAuthorized().should.equal(false);
          client.getImages(function(err, images) {
            client._isAuthorized().should.equal(true);
            should.not.exist(err);
            should.exist(images);
            server && server.done();
            authServer && authServer.done();
            done();
          });
        }, 5);
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
