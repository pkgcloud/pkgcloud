/*
* authentication-test.js: Tests for pkgcloud Rackspace compute authentication
*
* (C) 2010 Nodejitsu Inc.
*
*/

var should = require('should'),
    nock = require('nock'),
    macros = require('../macros'),
    helpers = require('../../helpers'),
    mock = !!process.env.NOCK;

describe('pkgcloud/rackspace/compute/authentication', function () {
  var client = helpers.createClient('rackspace', 'compute'),
      n;

  describe('The pkgcloud Rackspace Compute client', function () {
    it('should have core methods defined', function() {
      macros.shouldHaveCreds(client);
    });

    it('the getVersion() method should return the proper version', function (done) {
      if (mock) {
        n = nock('https://' + client.serversUrl)
          .get('/')
          .reply(200, { versions: [{ id: 'v1.0', status: 'BETA' }]}, {})
      }

      client.getVersion(function (err, version) {
        should.not.exist(err);
        should.exist(version);
        version.should.equal('v1.0');
        n.done();
        done();
      });
    });


    
    describe('the auth() method with a valid username and api key', function () {
      var client = helpers.createClient('rackspace', 'compute'),
        err, res;

      beforeEach(function (done) {

        if (mock) {
          var credentials = {
            username: client.config.username,
            key: client.config.apiKey
          };

          n = nock('https://' + client.authUrl)
            .get('/v1.0')
            .reply(204, '', JSON.parse(helpers.loadFixture('rackspace/auth.json')));
        }

        client.auth(function (e, r) {
          err = e;
          res = r;
          n.done();
          done();
        });
      });

      it('should respond with 200 and appropriate info', function () {
        should.not.exist(err);
        should.exist(res);
        res.statusCode.should.equal(204);
        res.headers.should.be.a('object');
      });

      it('should update the config with appropriate urls', function () {
        var config = client.config;
        config.serverUrl.should.equal(res.headers['x-server-management-url']);
        config.storageUrl.should.equal(res.headers['x-storage-url']);
        config.cdnUrl.should.equal(res.headers['x-cdn-management-url']);
        config.authToken.should.equal(res.headers['x-auth-token']);
      });

      it('the getLimits() method should return the proper limits', function (done) {
        if (mock) {
          n = nock('https://' + client.serversUrl)
            .get('/v1.0/537645/limits')
            .reply(200, { limits: { absolute: { maxPrivateIPs: 0 }, rate: [] } }, {});
        }

        client.getLimits(function (err, limits) {
          should.not.exist(err);
          should.exist(limits);
          should.exist(limits.absolute);
          should.exist(limits.rate);
          limits.rate.should.be.instanceOf(Array);
          n.done();
          done();
        });
      });
    });

    describe('the auth() method with an invalid username and api key', function () {

      var badClient = helpers.createClient('rackspace', 'database', {
        username: 'fake',
        apiKey: 'data'
      });

      var err, res;

      beforeEach(function (done) {

        if (mock) {
          n = nock('https://' + client.authUrl)
            .post('/v1.1/auth', { credentials: { username: 'fake', key: 'data' }})
            .reply(401, {
              unauthorized: {
                message: 'Username or api key is invalid', code: 401
              }
            });
        }

        badClient.auth(function (e, r) {
          err = e;
          res = r;
          n.done();
          done();
        });

      });

      it('should respond with Error code 401', function () {
        should.exist(err);
        should.not.exist(res);
        should.exist(err.unauthorized);
        err.unauthorized.code.should.equal(401);
      });
    });
  });
});
