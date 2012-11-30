/*
 * users-test.js: Tests for Rackspace Cloud Database users within an instace
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var vows = require('vows'),
    assert = require('../../helpers/assert'),
    nock = require('nock'),
    helpers = require('../../helpers');

var client = helpers.createClient('rackspace', 'database'),
    testContext = {};

if (process.env.NOCK) {
  var credentials = {
     username: client.config.username,
     key: client.config.apiKey
  };
  
  nock('https://' + client.authUrl)
    .post('/v1.1/auth', { "credentials": credentials })
      .reply(200, helpers.loadFixture('rackspace/token.json'));
  
  nock('https://ord.databases.api.rackspacecloud.com')  
    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .post('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', 
      "{\"users\":[{\"name\":\"joeTest\",\"password\":\"joepasswd\",\"databases\":[]}]}")
      .reply(202)

    .post('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', 
      "{\"users\":[{\"name\":\"joeTestTwo\",\"password\":\"joepasswd\",\"databases\":[]}]}")
      .reply(202)

    .post('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users', 
      "{\"users\":[{\"name\":\"joeTestThree\",\"password\":\"joepasswd\",\"databases\":[]}]}")
      .reply(202)

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .get('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users?limit=1')
      .reply(200, helpers.loadFixture('rackspace/databaseUsersLimit.json'))

    .get('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users?')
      .reply(200, helpers.loadFixture('rackspace/databaseUsers.json'))

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .get('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users?limit=1&marker=joeTest')
      .reply(200, helpers.loadFixture('rackspace/databaseUsersLimitOffset.json'))

    .get('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users?marker=joeTest')
      .reply(200, "{\"users\": [{\"name\": \"joeTestTwo\", \"databases\": []}, {\"name\": \"joeTestThree\", \"databases\": []}]}")

    .delete('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users/joeTest')
      .reply(202)

    .delete('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/users/joeTestTwo')
      .reply(202)

    .post('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/root')
      .reply(200, "{\"user\": {\"password\": \"dbba235b-d078-42ec-b992-dec1464c49cc\", \"name\": \"root\"}}")

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .get('/v1.0/537645//instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/root')
      .reply(200, "{\"rootEnabled\": true}")

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
}

vows.describe('pkgcloud/rackspace/databases/users').addBatch({
  "The pkgcloud Rackspace User client": {
    "the createUser() method": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
            client.createUser({
              username: 'joeTest',
              password: 'joepasswd',
              database: 'TestDatabase',
              instance: instance
            }, self.callback);
        });
      },
      "should respond correctly": function (err, response) {
        assert.isNull(err);
        assert.ok(response);
        assert.equal(response.statusCode, 202);
      }
    },
    "create an other user for test pagination": {
      topic: function () {
        var self = this;
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
            }, self.callback);
          })
        })
      },
      "shoudl respond correctly": function (err, response) {
        assert.isNull(err);
        assert.ok(response);
        assert.equal(response.statusCode, 202);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the getUsers() method": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.getUsers({ instance: instance }, self.callback);
        });
      },
      "should get the list of users": function (err, users) {
        assert.isNull(err);
        assert.isArray(users);
        users.forEach(function (user) {
          assert.assertUser(user);
        });
      }
    },
    "the getUsers() method with limit": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.getUsers({ instance: instance, limit:1 }, self.callback);
        });
      },
      "should respond one element": function (err, users) {
        assert.isNull(err);
        assert.isArray(users);
        assert.equal(users.length, 1);
      },
      "should pass as third argument the offset mark": function (err, users, offset) {
        assert.isNull(err);
        assert.isNotNull(offset);
        assert.ok(offset);
        testContext.marker = offset;
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace database client": {
    "the getUsers() method with offset": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.getUsers({ instance: instance, offset: testContext.marker }, self.callback);
        });
      },
      "should respond less quantity": function (err, users, offset) {
        assert.isNull(err);
        assert.isArray(users);
        assert.equal(users.length, 2);
        assert.isNull(offset);
      }
    },
    "the getUsers() method with limit and offset": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.getUsers({ instance: instance, limit:1, offset: testContext.marker }, self.callback);
        });
      },
      "should respond just one result with more next points": function (err, users, offset) {
        assert.isNull(err);
        assert.isArray(users);
        assert.equal(users.length, 1);
        assert.ok(offset);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the destroyUsers() method": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.destroyUser(instance, 'joeTest', self.callback);
        });
      },
      "should respond correctly": function (err, response) {
        assert.isNull(err);
        assert.ok(response);
        assert.equal(response.statusCode, 202);
      }
    },
    "destroy the user used for pagination": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.destroyUser(instance, 'joeTestTwo', self.callback);
        });
      },
      "should respond correctly": function (err, response) {
        assert.isNull(err);
        assert.ok(response);
        assert.equal(response.statusCode, 202);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the enableRoot() method": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.enableRoot(instance, self.callback);
        });
      },
      "should respond correctly": function (err, user, response) {
        assert.isNull(err);
        assert.assertUser(user);
        assert.ok(response);
        assert.equal(response.statusCode, 200);
        assert.ok(response.body);
        assert.isObject(response.body.user);
        assert.ok(response.body.user.password);
        assert.equal(response.body.user.name, 'root');
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the rootEnabled() method": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.rootEnabled(instance, self.callback);
        });
      },
      "should respond correctly": function (err, root, response) {
        assert.isNull(err);
        assert.ok(root);
        assert.ok(response);
        assert.equal(response.statusCode, 200);
      }
    }
  }
}).export(module);