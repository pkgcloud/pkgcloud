/*
 * users-test.js: Tests for Openstack Trove users within an instace
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var should = require('should'),
  async = require('async'),
  hock = require('hock'),
  http = require('http'),
  helpers = require('../../helpers'),
  User = require('../../../lib/pkgcloud/openstack/database/user').User,
  providers = require('../../configs/providers.json'),
  mock = !!process.env.MOCK;

// Declaring variables for helper functions defined later
var setupAuthenticationMock, setupCreateUserMock, setupCreateAnotherUserMock,
    setupCreateMultiplsUsersMock, setupCreateUsersWithRestrictedCharacters,
    setupGetUsersMock, setupEnableRootMock, setupEnableRootMockWithStatus,
    setupDestroyUsersMock, setupDestroyUsersMockWithPagination;

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].database && provider !== 'azure';
}).forEach(function (provider) {
describe('pkgcloud/['+provider+']/databases/users', function () {
  var client, authHockInstance, hockInstance, authServer, server;

  describe('The pkgcloud '+provider+' Database client', function () {

    before(function (done) {
      client = helpers.createClient(provider, 'database');

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

    it('the createUser() method should respond correctly', function (done) {
      if (mock) {
        setupAuthenticationMock(authHockInstance, hockInstance, provider);
        setupCreateUserMock(authHockInstance, hockInstance, provider);
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
          authHockInstance && authHockInstance.done();
          hockInstance && hockInstance.done();
          done();
        });
      });

    });

    it('the createUser() method should work with databases argument', function (done) {
      if (mock) {
          setupCreateUserMock(authHockInstance, hockInstance, provider);
      }

      helpers.selectInstance(client, function (instance) {
        client.createUser({
          username: 'joeTest',
          password: 'joepasswd',
          databases: ['TestDatabase'],
          instance: instance
        }, function (err, response) {
          should.not.exist(err);
          should.exist(response);
          response.statusCode.should.equal(202);
          authHockInstance && authHockInstance.done();
          hockInstance && hockInstance.done();
          done();
        });
      });

    });

    it('create an other user for test pagination should response correctly', function (done) {

      if (mock) {
        setupCreateAnotherUserMock(hockInstance, provider);
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
            hockInstance && hockInstance.done();
            done();
          });
        });
      });
    });

    it('create multiple users in one request should response correctly', function (done) {

      if (mock) {
        setupCreateMultiplsUsersMock(hockInstance, provider);
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
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    it('create users with questionable characters should respond with error', function (done) {

      if (mock) {
        setupCreateUsersWithRestrictedCharacters(hockInstance, provider);
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
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    it('the getUsers() method should get the list of users', function (done) {

      if (mock) {
        setupGetUsersMock(hockInstance, provider);
      }

      helpers.selectInstance(client, function (instance) {
        client.getUsers({ instance: instance }, function (err, list) {
          should.not.exist(err);
          should.exist(list);
          list.should.be.an.Array;
          list.forEach(function (user) {
            user.should.be.instanceOf(User);
          });
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    describe('the destroyUsers() method', function() {
      it('should respond correctly', function(done) {

        if (mock) {
          setupDestroyUsersMock(hockInstance, provider);
        }

        helpers.selectInstance(client, function (instance) {
          client.destroyUser(instance, 'joeTest', function(err, response) {
            should.not.exist(err);
            should.exist(response);
            response.statusCode.should.equal(202);
            hockInstance && hockInstance.done();
            done();
          });
        });
      });

      it('should destroy the user used for pagination', function(done) {

        if (mock) {
          setupDestroyUsersMockWithPagination(hockInstance, provider);
        }

        helpers.selectInstance(client, function (instance) {
          client.destroyUser(instance, 'joeTestTwo', function (err, response) {
            should.not.exist(err);
            should.exist(response);
            response.statusCode.should.equal(202);
            hockInstance && hockInstance.done();
            done();
          });
        });
      });
    });

    it('the enableRoot() method should respond correctly', function(done) {

      if (mock) {
        setupEnableRootMock(hockInstance, provider);
      }

      helpers.selectInstance(client, function (instance) {
        client.enableRoot(instance, function(err, user, response) {
          should.not.exist(err);
          should.exist(user);
          should.exist(response);
          response.statusCode.should.equal(200);
          should.exist(response.body);
          response.body.user.should.be.a.Object;
          should.exist(response.body.user.password);
          response.body.user.name.should.equal('root');
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    it('the enableRoot() method should respond correctly', function (done) {

      if (mock) {
        setupEnableRootMockWithStatus(hockInstance, provider);
      }

      helpers.selectInstance(client, function (instance) {
        client.rootEnabled(instance, function (err, root, response) {
          should.not.exist(err);
          should.exist(root);
          should.exist(response);
          response.statusCode.should.equal(200);
          hockInstance && hockInstance.done();
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
          server.close(next);
        },
        function (next) {
          authServer.close(next);
        }
      ], done);
    });
  });
});
});

setupAuthenticationMock = function (authHockInstance, hockInstance, provider)  {
  if (provider === 'rackspace') {
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
    else if (provider === 'openstack')   {
      authHockInstance
        .post('/v2.0/tokens', {
          auth: {
            passwordCredentials: {
              username: 'MOCK-USERNAME',
              password: 'MOCK-PASSWORD'
            }
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/initialToken.json')
        .get('/v2.0/tenants')
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/tenantId.json')
        .post('/v2.0/tokens', {
          auth: {
            passwordCredentials: {
              username: 'MOCK-USERNAME',
              password: 'MOCK-PASSWORD'
            },
            tenantId: '72e90ecb69c44d0296072ea39e537041'
          }
        })
        .reply(200, helpers.getOpenstackAuthResponse());
    }
    else if (provider === 'hp') {
      authHockInstance.post('/v2.0/tokens', {
        auth: {
          apiAccessKeyCredentials: {
            accessKey: 'MOCK-USERNAME',
            secretKey: 'MOCK-API-KEY'
          }
        }
      })
      .replyWithFile(200, __dirname + '/../../fixtures/hp/initialToken.json')
      .get('/v2.0/tenants')
      .replyWithFile(200, __dirname + '/../../fixtures/hp/tenantId.json')
      .post('/v2.0/tokens', {
        auth: {
          apiAccessKeyCredentials: {
            accessKey: 'MOCK-USERNAME',
            secretKey: 'MOCK-API-KEY'
          },
          tenantId: '5ACED3DC3AA740ABAA41711243CC6949'
        }
      })
      .reply(200, helpers.gethpAuthResponse());
    }
    else if (provider === 'openstack') {
      authHockInstance.post('/v2.0/tokens', {
          auth: {
            passwordCredentials: {
              username: 'MOCK-USERNAME',
              password: 'MOCK-PASSWORD'
            }
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/initialToken.json')
        .get('/v2.0/tenants')
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/tenantId.json')
        .post('/v2.0/tokens', {
          auth: {
            passwordCredentials: {
              username: 'MOCK-USERNAME',
              password: 'MOCK-PASSWORD'
            },
            tenantId: '72e90ecb69c44d0296072ea39e537041'
          }
        })
        .reply(200, helpers.getOpenstackAuthResponse());
    }
    else {
      throw new Error('not supported');
    }
};

setupCreateUserMock = function (authHockInstance, hockInstance, provider) {
  if (provider === 'rackspace') {
        hockInstance
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', {
            users: [
              {
                name: 'joeTest',
                password: 'joepasswd',
                databases: [ { name: 'TestDatabase' } ]
              }
            ]
          })
          .reply(202);
  }
  else if ( provider === 'openstack' ){
    hockInstance
      .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances')
      .reply(200, helpers.loadFixture('hp/databaseInstances.json'))
      .post('/v1.0/72e90ecb69c44d0296072ea39e537041/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', {
        users: [
          {
            name: 'joeTest',
            password: 'joepasswd',
            databases: [ { name: 'TestDatabase' } ]
          }
        ]
      })
      .reply(202);
  }
  else if ( provider === 'hp' ){
    hockInstance
      .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances')
      .reply(200, helpers.loadFixture('hp/databaseInstances.json'))
      .post('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', {
        users: [
          {
            name: 'joeTest',
            password: 'joepasswd',
            databases: [ { name: 'TestDatabase' } ]
          }
        ]
      })
      .reply(202);
  }
  else {
    throw new Error('not supported');
  }
};

setupCreateAnotherUserMock = function (hockInstance, provider) {
  if (provider === 'rackspace') {
    hockInstance
      .get('/v1.0/123456/instances')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
      .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', {
        users: [
          {
            name: 'joeTestTwo',
            password: 'joepasswd',
            databases: [
              { name: 'TestDatabase' }
            ]
          }
        ]
      })
      .reply(202)
      .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', {
        users: [
          {
            name: 'joeTestThree',
            password: 'joepasswd',
            databases: [
              { name: 'TestDatabase' }
            ]
          }
        ]
      })
      .reply(202);
    }
    else if (provider === 'hp') {
      hockInstance
        .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances')
        .reply(200, helpers.loadFixture('hp/databaseInstances.json'))
        .post('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', {
          users: [
            {
              name: 'joeTestTwo',
              password: 'joepasswd',
              databases: [
                { name: 'TestDatabase' }
              ]
            }
          ]
        })
        .reply(202)
        .post('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', {
          users: [
            {
              name: 'joeTestThree',
              password: 'joepasswd',
              databases: [
                { name: 'TestDatabase' }
              ]
            }
          ]
        })
        .reply(202);
    }
    else if (provider === 'openstack') {
      hockInstance
        .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances')
        .reply(200, helpers.loadFixture('hp/databaseInstances.json'))
        .post('/v1.0/72e90ecb69c44d0296072ea39e537041/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', {
          users: [
            {
              name: 'joeTestTwo',
              password: 'joepasswd',
              databases: [
                { name: 'TestDatabase' }
              ]
            }
          ]
        })
        .reply(202)
        .post('/v1.0/72e90ecb69c44d0296072ea39e537041/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', {
          users: [
            {
              name: 'joeTestThree',
              password: 'joepasswd',
              databases: [
                { name: 'TestDatabase' }
              ]
            }
          ]
        })
        .reply(202);
    }
    else {
      throw new Error('not supported');
    }
};

setupCreateMultiplsUsersMock = function (hockInstance, provider) {
  if (provider === 'rackspace') {
        hockInstance
            .get('/v1.0/123456/instances')
            .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
            .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', {
              users: [
                {
                  name: 'joeTestFour',
                  password: 'joepasswd',
                  databases: [
                    { name: 'TestDatabase' }
                  ]
                },
                {
                  name: 'joeTestFive',
                  password: 'joepasswd',
                  databases: [
                    { name: 'TestDatabase' }
                  ]
                }
              ]
            })
            .reply(202);
  }
  else if ( provider === 'hp' ){
    hockInstance
            .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances')
            .reply(200, helpers.loadFixture('hp/databaseInstances.json'))
            .post('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', {
              users: [
                {
                  name: 'joeTestFour',
                  password: 'joepasswd',
                  databases: [
                    { name: 'TestDatabase' }
                  ]
                },
                {
                  name: 'joeTestFive',
                  password: 'joepasswd',
                  databases: [
                    { name: 'TestDatabase' }
                  ]
                }
              ]
            })
            .reply(202);
  }
  else if ( provider === 'openstack' ){
      hockInstance
              .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances')
              .reply(200, helpers.loadFixture('openstack/databaseInstances.json'))
              .post('/v1.0/72e90ecb69c44d0296072ea39e537041/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', {
                users: [
                  {
                    name: 'joeTestFour',
                    password: 'joepasswd',
                    databases: [
                      { name: 'TestDatabase' }
                    ]
                  },
                  {
                    name: 'joeTestFive',
                    password: 'joepasswd',
                    databases: [
                      { name: 'TestDatabase' }
                    ]
                  }
                ]
              })
              .reply(202);
  }
  else {
    throw new Error('not supported');
  }
};

setupCreateUsersWithRestrictedCharacters = function (hockInstance, provider) {
  if (provider === 'rackspace') {
    hockInstance
      .get('/v1.0/123456/instances')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'));
  }
  else if ( provider === 'openstack' ){
    hockInstance
      .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances')
      .reply(200, helpers.loadFixture('openstack/databaseInstances.json'));
  }
  else if ( provider === 'hp' ){
    hockInstance
      .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances')
      .reply(200, helpers.loadFixture('hp/databaseInstances.json'));
  }
  else {
    throw new Error('not supported');
  }
};

setupGetUsersMock = function (hockInstance, provider) {
  if (provider === 'rackspace') {
    hockInstance
        .get('/v1.0/123456/instances')
        .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
        .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users')
        .reply(200, helpers.loadFixture('rackspace/databaseUsers.json'));
  }
  else if ( provider === 'openstack' ){
    hockInstance
          .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances')
          .reply(200, helpers.loadFixture('openstack/databaseInstances.json'))
          .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users')
          .reply(200, helpers.loadFixture('openstack/databaseUsers.json'));
  }
  else if ( provider === 'hp' ){
    hockInstance
        .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances')
        .reply(200, helpers.loadFixture('hp/databaseInstances.json'))
        .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users')
        .reply(200, helpers.loadFixture('hp/databaseUsers.json'));
  }
  else {
    throw new Error('not supported');
  }

};

setupEnableRootMock = function (hockInstance, provider) {
  if (provider === 'rackspace') {
    hockInstance
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
  else if (provider === 'openstack') {
    hockInstance
      .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances')
      .reply(200, helpers.loadFixture('openstack/databaseInstances.json'))
      .post('/v1.0/72e90ecb69c44d0296072ea39e537041/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/root')
      .reply(200, {
        user: {
          password: 'dbba235b-d078-42ec-b992-dec1464c49cc',
          name: 'root'
        }
      });
  }
  else if (provider === 'hp') {
    hockInstance
      .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances')
      .reply(200, helpers.loadFixture('hp/databaseInstances.json'))
      .post('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/root')
      .reply(200, {
        user: {
          password: 'dbba235b-d078-42ec-b992-dec1464c49cc',
          name: 'root'
        }
      });
  }
};

setupEnableRootMockWithStatus = function (hockInstance, provider) {
  if (provider === 'rackspace') {
  hockInstance
    .get('/v1.0/123456/instances')
    .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
    .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/root')
    .reply(200, { rootEnabled: true });
  }
  else if (provider === 'openstack') {
    hockInstance
      .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances')
      .reply(200, helpers.loadFixture('openstack/databaseInstances.json'))
      .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/root')
      .reply(200, { rootEnabled: true });
  }
  else if (provider === 'hp') {
    hockInstance
      .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances')
      .reply(200, helpers.loadFixture('hp/databaseInstances.json'))
      .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/root')
      .reply(200, { rootEnabled: true });
  }
};

setupDestroyUsersMock = function (hockInstance, provider) {
  if (provider === 'rackspace') {
    hockInstance
      .get('/v1.0/123456/instances')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
      .delete('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users/joeTest')
      .reply(202);
  }
  else if (provider === 'openstack') {
    hockInstance
      .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances')
      .reply(200, helpers.loadFixture('openstack/databaseInstances.json'))
      .delete('/v1.0/72e90ecb69c44d0296072ea39e537041/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users/joeTest')
      .reply(202);
  }
  else if (provider === 'hp') {
    hockInstance
      .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances')
      .reply(200, helpers.loadFixture('hp/databaseInstances.json'))
      .delete('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users/joeTest')
      .reply(202);
  }
};

setupDestroyUsersMockWithPagination = function (hockInstance, provider) {
  if (provider === 'rackspace') {
    hockInstance
        .get('/v1.0/123456/instances')
        .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
        .delete('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users/joeTestTwo')
        .reply(202);
  }
  else if (provider === 'openstack') {
    hockInstance
        .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances')
        .reply(200, helpers.loadFixture('openstack/databaseInstances.json'))
        .delete('/v1.0/72e90ecb69c44d0296072ea39e537041/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users/joeTestTwo')
        .reply(202);
  }
  else if (provider === 'hp') {
    hockInstance
        .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances')
        .reply(200, helpers.loadFixture('hp/databaseInstances.json'))
        .delete('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users/joeTestTwo')
        .reply(202);
  }
};
