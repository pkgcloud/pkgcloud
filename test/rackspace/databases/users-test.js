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
  nock('https://' + client.serversUrl)
    .post('/v1.0/537645/instances/b601038d-d896-4f6b-9f62-e83a1d5c0e85/users',
      "{\"users\":[{\"name\":\"joeTest\",\"password\":\"joepasswd\",\"databases\":[]}]}")
      .reply(202, "202 Accepted\n\nThe request is accepted for processing.\n\n   ");

  nock('https://' + client.serversUrl)
    .get('/v1.0/537645/instances/b601038d-d896-4f6b-9f62-e83a1d5c0e85/users')
      .reply(200, "{\"users\": [{\"name\": \"joeTest\"}]}");

  nock('https://' + client.serversUrl)
    .delete('/v1.0/537645/instances/b601038d-d896-4f6b-9f62-e83a1d5c0e85/users/joeTest')
      .reply(202, "202 Accepted\n\nThe request is accepted for processing.\n\n   ");

  nock('https://' + client.serversUrl)
    .post('/v1.0/537645/instances/b601038d-d896-4f6b-9f62-e83a1d5c0e85/root')
      .reply(200, "{\"user\": {\"password\": \"038cdd63-4a15-447c-9cbf-46242e3027a1\", \"name\": \"root\"}}");

  nock('https://' + client.serversUrl)
    .get('/v1.0/537645//instances/b601038d-d896-4f6b-9f62-e83a1d5c0e85/root')
      .reply(200, "{\"rootEnabled\": true}");
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
          }, self.callback)
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