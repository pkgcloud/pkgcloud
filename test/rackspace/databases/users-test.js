/*
 * users-test.js: Tests for Rackspace Cloud Database users within an instace
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var should = require('should'),
  async = require('async'),
  hock = require('hock'),
  helpers = require('../../helpers'),
  User = require('../../../lib/pkgcloud/rackspace/database/user').User,
  mock = !!process.env.MOCK;

describe('pkgcloud/rackspace/databases/users', function () {
  var testContext = {},
    client, authServer, server;

  describe('The pkgcloud Rackspace Database client', function () {

    before(function (done) {
      client = helpers.createClient('rackspace', 'database');

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
    
    it('the createUser() method should respond correctly', function (done) {
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
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/auth.json');

        server
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', {
            users: [
              {
                name: 'joeTest',
                password: 'joepasswd',
                databases: []
              }
            ]
          })
          .reply(202);
      }

      helpers.selectInstance(client, function (instance) {
        client.createUser({
          username: 'joeTest',
          password: 'joepasswd',
          database: 'TestDatabase',
          instance: instance
        }, function (err, response) {
          should.not.exist(err);
          should.exist(response);
          response.statusCode.should.equal(202);
          authServer && authServer.done();
          server && server.done();
          done();
        });
      });

    });

    it('create an other user for test pagination should response correctly', function (done) {

      if (mock) {
        server
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', {
            users: [
              {
                name: 'joeTestTwo',
                password: 'joepasswd',
                databases: []
              }
            ]
          })
          .reply(202)
          .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', {
            users: [
              {
                name: 'joeTestThree',
                password: 'joepasswd',
                databases: []
              }
            ]
          })
          .reply(202);
      }

      helpers.selectInstance(client, function (instance) {
        client.createUser({
          username: 'joeTestTwo',
          password: 'joepasswd',
          database: 'TestDatabase',
          instance: instance
        }, function () {
          client.createUser({
            username: 'joeTestThree',
            password: 'joepasswd',
            database: 'TestDatabase',
            instance: instance
          }, function (err, response) {
            should.not.exist(err);
            should.exist(response);
            response.statusCode.should.equal(202);
            server && server.done();
            done();
          });
        });
      });
    });

    it('create multiple users in one request should response correctly', function (done) {

      if (mock) {
        server
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', {
            users: [
              {
                name: 'joeTestFour',
                password: 'joepasswd',
                databases: []
              },
              {
                name: 'joeTestFive',
                password: 'joepasswd',
                databases: []
              }
            ]
          })
          .reply(202);
      }

      helpers.selectInstance(client, function (instance) {
        client.createUser([
          {
            username: 'joeTestFour',
            password: 'joepasswd',
            database: 'TestDatabase',
            instance: instance
          },
          {
            username: 'joeTestFive',
            password: 'joepasswd',
            database: 'TestDatabase',
            instance: instance
          }
        ], function (err, response) {
          should.not.exist(err);
          should.exist(response);
          response.statusCode.should.equal(202);
          server && server.done();
          done();
        });
      });
    });

    it('create users with questionable characters should respond with error', function (done) {

      if (mock) {
        server
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'));
      }

      helpers.selectInstance(client, function (instance) {
        client.createUser({
          username: '@joeTestSix',
          password: 'joepasswd',
          database: 'TestDatabase',
          instance: instance
        }, function (err, response) {
          should.exist(err);
          should.not.exist(response);
          server && server.done();
          done();
        });
      });
    });

    it('the getUsers() method should get the list of users', function (done) {

      if (mock) {
        server
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users')
          .reply(200, helpers.loadFixture('rackspace/databaseUsers.json'));
      }

      helpers.selectInstance(client, function (instance) {
        client.getUsers({ instance: instance }, function (err, list) {
          should.not.exist(err);
          should.exist(list);
          list.should.be.instanceOf(Array);
          list.forEach(function (user) {
            user.should.be.instanceOf(User);
          });
          server && server.done();
          done();
        });
      });
    });

    describe('the getUsers() method', function () {

      var err, list, offset;

      before(function (done) {

        if (mock) {
          server
            .get('/v1.0/123456/instances')
            .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
            .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users?limit=1')
            .reply(200, helpers.loadFixture('rackspace/databaseUsersLimit.json'));
        }

        helpers.selectInstance(client, function (instance) {
          client.getUsers({ instance: instance, limit: 1 }, function (e, l, o) {
            err = e;
            list = l;
            offset = o;
            server && server.done();
            done();
          });
        });
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
          server
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
            list.should.be.instanceOf(Array);
            list.should.have.length(2);
            should.not.exist(offset);
            server && server.done();
            done();
          });
        });
      });

      it('with limit and offset should responsd with just result with more next points', function(done) {

        if (mock) {
          server
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
            list.should.be.instanceOf(Array);
            list.should.have.length(1);
            should.exist(offset);
            server && server.done();
            done();
          });
        });
      });
    });

    describe('the destroyUsers() method', function() {
      it('should respond correctly', function(done) {

        if (mock) {
          server
            .get('/v1.0/123456/instances')
            .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
            .delete('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users/joeTest')
            .reply(202);
        }

        helpers.selectInstance(client, function (instance) {
          client.destroyUser(instance, 'joeTest', function(err, response) {
            should.not.exist(err);
            should.exist(response);
            response.statusCode.should.equal(202);
            server && server.done();
            done();
          });
        });
      });

      it('should destroy the user used for pagination', function(done) {

        if (mock) {
          server
            .get('/v1.0/123456/instances')
            .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
            .delete('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users/joeTestTwo')
            .reply(202);
        }

        helpers.selectInstance(client, function (instance) {
          client.destroyUser(instance, 'joeTestTwo', function (err, response) {
            should.not.exist(err);
            should.exist(response);
            response.statusCode.should.equal(202);
            server && server.done();
            done();
          });
        });
      });
    });

    it('the enableRoot() method should respond correctly', function(done) {

      if (mock) {
        server
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/root')
          .reply(200, {
            user: {
              password: 'dbba235b-d078-42ec-b992-dec1464c49cc',
              name: 'root'
            }
          });
      }

      helpers.selectInstance(client, function (instance) {
        client.enableRoot(instance, function(err, user, response) {
          should.not.exist(err);
          should.exist(user);
          should.exist(response);
          response.statusCode.should.equal(200);
          should.exist(response.body);
          response.body.user.should.be.a('object');
          should.exist(response.body.user.password);
          response.body.user.name.should.equal('root');
          server && server.done();
          done();
        });
      });
    });

    it('the enableRoot() method should respond correctly', function (done) {

      if (mock) {
        server
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/root')
          .reply(200, { rootEnabled: true });
      }

      helpers.selectInstance(client, function (instance) {
        client.rootEnabled(instance, function (err, root, response) {
          should.not.exist(err);
          should.exist(root);
          should.exist(response);
          response.statusCode.should.equal(200);
          server && server.done();
          done();
        });
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
