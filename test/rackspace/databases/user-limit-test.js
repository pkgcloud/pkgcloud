/*
 * users-limit-test.js: Tests for Cloud Database users within an instace
 *
 * (C) 2010 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 * MIT LICENSE
 *
 */

var should = require('should'),
  async = require('async'),
  hock = require('hock'),
  http = require('http'),
  helpers = require('../../helpers'),
  mock = !!process.env.MOCK;

// Declaring variables for helper functions defined later
var setupAuthenticationMock, setupGetUsersMock;

  describe('pkgcloud/[rackspace]/databases/users/limits', function () {
    var testContext = {},
      client, authHockInstance, hockInstance, authServer,
      server, err, list, offset;

    before(function (done) {
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
      ]);

      if (mock) {
        setupAuthenticationMock(authHockInstance);
        setupGetUsersMock(hockInstance);
      }

      helpers.selectInstance(client, function (instance) {
        client.getUsers({ instance: instance, limit: 1 }, function (e, l, o) {
          err = e;
          list = l;
          offset = o;
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    after(function() {
      server.close();
      authServer.close();
    });

    it('with limit should respond with one element', function () {
      should.not.exist(err);
      should.exist(list);
      list.should.have.length(1);
    });

    it('with limitshould pass as third argument the offset mark', function () {
      should.exist(offset);
      testContext.marker = offset;
    });

    it('with offset should respond less quantity', function (done) {

      if (mock) {
        hockInstance
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users?marker=joeTest')
          .reply(200, {
            users: [
              { name: 'joeTestTwo', databases: []},
              { name: 'joeTestThree', databases: []}
            ]
          });
      }

      helpers.selectInstance(client, function (instance) {
        client.getUsers({ instance: instance, offset: testContext.marker }, function (err, list, offset) {
          should.not.exist(err);
          should.exist(list);
          list.should.be.an.Array;
          list.should.have.length(2);
          should.not.exist(offset);
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    it('with limit and offset should responsd with just result with more next points', function(done) {

      if (mock) {
        hockInstance
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users?limit=1&marker=joeTest')
          .reply(200, helpers.loadFixture('rackspace/databaseUsersLimitOffset.json'));
      }

      helpers.selectInstance(client, function (instance) {
        client.getUsers({
          instance: instance,
          limit: 1,
          offset:testContext.marker }, function(err, list, offset) {
          should.not.exist(err);
          should.exist(list);
          list.should.be.an.Array;
          list.should.have.length(1);
          should.exist(offset);
          hockInstance && hockInstance.done();
          done();
        });
      });
    });
  });

setupGetUsersMock = function(hockInstance) {
  hockInstance
      .get('/v1.0/123456/instances')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
      .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users?limit=1')
      .reply(200, helpers.loadFixture('rackspace/databaseUsersLimit.json'));
};

setupAuthenticationMock = function(authHockInstance)  {
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
};
