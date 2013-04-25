/*
* authentication-test.js: Tests for pkgcloud Rackspace storage authentication
*
* (C) 2010 Nodejitsu Inc.
*
*/

var should = require('should'),
    macros = require('../macros'),
    helpers = require('../../helpers'),
    nock = require('nock'),
    mock = !!process.env.NOCK;

describe('pkgcloud/rackspace/storage/authentication', function () {

  var client = helpers.createClient('rackspace', 'storage');

  describe('The pkgcloud Rackspace Storage client', function () {
    it('should have core methods defined', function() {
      macros.shouldHaveCreds(client);
    });

    describe('the auth() method', function() {
      describe('with a valid user name and api key', function() {
        var client = helpers.createClient('rackspace', 'storage'),
            err, res;

        beforeEach(function (done) {
          nock('https://' + client.authUrl)
            .get('/v1.0')
            .reply(204, '',
              helpers.loadFixture('rackspace/auth.json', 'json'))

          client.auth(function (e, r) {
            err = e;
            res = r;
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
      });

      describe('with an invalid user name and api key shouldn\'t authenticate', function (done) {
        var client = helpers.createClient('rackspace', 'storage'),
            err, res;

        beforeEach(function (done) {
          nock('https://' + client.authUrl)
            .get('/v1.0')
            .reply(401)

          client.auth(function (e, r) {
            err = e;
            res = r;
            done();
          });
        });

        it('should respond with 401 unauthorized', function () {
          should.not.exist(err);
          should.exist(res);
          res.statusCode.should.equal(401);
        });
      });
    });
  });
});
