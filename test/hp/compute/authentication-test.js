/*
* authentication-test.js: Tests for pkgcloud hp compute authentication
*
* (C) 2014 Hewlett-Packard Development Company, L.P.
*
*/

var should = require('should'),
    async = require('async'),
    hock = require('hock'),
    http = require('http'),
    macros = require('../macros'),
    helpers = require('../../helpers'),
    mock = !!process.env.MOCK;

describe('pkgcloud/hp/compute/authentication', function () {
  var client, authHockInstance, hockInstance, authServer, server;

  describe('The pkgcloud hp Compute client', function () {

    before(function (done) {
      client = helpers.createClient('hp', 'compute');

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

    it('should have core methods defined', function() {
      macros.shouldHaveCreds(client);
    });

    describe('the auth() method with a valid username and api key', function () {
      beforeEach(function (done) {

        client = helpers.createClient('hp', 'compute');
        if (mock) {
          authHockInstance
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
          authHockInstance && authHockInstance.done();
          done();
        });
      });

      it('should update the config with appropriate urls', function () {
        client._identity.should.be.a.Object;
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

      var err;

      beforeEach(function (done) {

        if (mock) {
          authHockInstance
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
          authHockInstance && authHockInstance.done();
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
          // Ken: why is this console log present?
          if (this.event !== 'log::trace') {
            console.log(message);
            console.dir(obj);
          }
        });

        if (mock) {

          var response = helpers.gethpAuthResponse(new Date(new Date().getTime() + 1));

          tokenExpiry = response.access.token.expires;

          authHockInstance
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
          authHockInstance && authHockInstance.done();
          done();
        });
      });

      it('should update the config with appropriate urls', function () {
        client._identity.should.be.a.Object;
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
          authHockInstance
            .post('/v2.0/tokens', {
              auth: {
                'apiAccessKeyCredentials': {
                  accessKey: 'MOCK-USERNAME',
                  secretKey: 'MOCK-API-KEY'
                }
              }
            })
            .reply(200, helpers.gethpAuthResponse());

          hockInstance
            .get('/v2/5ACED3DC3AA740ABAA41711243CC6949/images/detail')
            .replyWithFile(200, __dirname + '/../../fixtures/hp/images.json');
        }

        setTimeout(function () {
          client._isAuthorized().should.equal(false);
          client.getImages(function(err, images) {
            client._isAuthorized().should.equal(true);
            should.not.exist(err);
            should.exist(images);
            hockInstance && hockInstance.done();
            authHockInstance && authHockInstance.done();
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
            server.close(next);
          },
          function (next) {
            authServer.close(next);
          }
        ], done);
    });
  });
});
