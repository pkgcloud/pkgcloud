/*
 * databases-test.js: Tests for Rackspace Cloud Database instances
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
      .reply(200, helpers.loadFixture('rackspace/token.json'))
    .post('/v1.1/auth', { "credentials": credentials })
      .reply(200, helpers.loadFixture('rackspace/token.json'));

  nock('https://ord.databases.api.rackspacecloud.com')
    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
    .post('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases', "{\"databases\":[{\"name\":\"TestDatabaseTwo\"}]}")
      .reply(202)
    .post('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases', "{\"databases\":[{\"name\":\"TestDatabase\"}]}")
      .reply(202)
    .post('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases', "{\"databases\":[{\"name\":\"TestDatabaseThree\"}]}")
      .reply(202)
    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
    .get('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases?limit=1')
      .reply(200, helpers.loadFixture('rackspace/databasesLimit.json'))
    .get('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases?')
      .reply(200, "{\"databases\": [{\"name\": \"TestDatabase\"}, {\"name\": \"TestDatabaseTwo\"}]}")
    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
    .get('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases?marker=TestDatabase')
      .reply(200, "{\"databases\": [{\"name\": \"TestDatabaseTwo\"}]}")
    .get('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases?limit=1&marker=TestDatabase')
      .reply(200, "{\"databases\": [{\"name\": \"TestDatabaseTwo\"}]}")
    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
    .delete('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases/TestDatabase')
      .reply(202)
    .delete('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases/TestDatabaseTwo')
      .reply(202)
}

vows.describe('pkgcloud/rackspace/databases/databases').addBatch({
  "The pkgcloud Rackspace Database client": {
    "the createDatabases() method": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.createDatabase({name: 'TestDatabase', instance:instance}, self.callback);
        });
      },
      "should respond correctly": function (err, response) {
        assert.isNull(err);
        assert.equal(response.statusCode, 202);
      }
    },
    "create another database for pagination test": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.createDatabase({name: 'TestDatabaseTwo', instance:instance}, self.callback);
        });
      },
      "should respond correctly": function (err, response) {
        assert.isNull(err);
        assert.equal(response.statusCode, 202);
      }
    },
    "the create() method": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.create({name: 'TestDatabaseThree', instance:instance}, self.callback);
        });
      },
      "should respond correctly": function (err, response) {
        assert.isNull(err);
        assert.equal(response.statusCode, 202);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the createDatabase() method with no name": {
      topic: function () {
        client.createDatabase({}, this.callback);
      },
      "should get error for name": function (err, response) {
        assert.isObject(err);
        assert.isString(err.message);
        assert.isUndefined(response);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the createDatabase() method with no instance": {
      topic: function () {
        client.createDatabase({ name: 'NotCreated' }, this.callback);
      },
      "should get error for instance": function (err, response) {
        assert.isObject(err);
        assert.isString(err.message);
        assert.isUndefined(response);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the getDatabases() method": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.getDatabases({ instance: instance }, self.callback);
        });
      },
      "should return a list of databases": function (err, list) {
        assert.isNull(err);
        assert.isArray(list);
        assert.ok(list.length > 0);
      },
      "the list should have names": function (err, list) {
        assert.ok(list[0]);
        assert.ok(list[0].name);
        assert.isString(list[0].name);
      }
    },
    "the getDatabases() method with limit": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.getDatabases({ instance: instance, limit:1 }, self.callback);
        });
      },
      "should respond one element": function (err, instances) {
        assert.isNull(err);
        assert.isArray(instances);
        assert.equal(instances.length, 1);
      },
      "should pass as third argument the offset mark": function (err, instances, offset) {
        assert.isNull(err);
        assert.isNotNull(offset);
        assert.ok(offset);
        testContext.marker = offset;
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace database client": {
    "the getDatabases() method with offset": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.getDatabases({ instance: instance, offset: testContext.marker }, self.callback);
        });
      },
      "should respond less quantity": function (err, instances, offset) {
        assert.isNull(err);
        assert.isArray(instances);
        assert.equal(instances.length, 1);
        assert.isNull(offset);
      }
    },
    "the getDatabases() method with limit and offset": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.getDatabases({ instance: instance, limit:1, offset: testContext.marker }, self.callback);
        });
      },
      "should respond just one result with no more next points": function (err, instances, offset) {
        assert.isNull(err);
        assert.isArray(instances);
        assert.equal(instances.length, 1);
        assert.isNull(offset);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the destroyDatabase() method": {
      "with first db": {
        topic: function () {
          var self = this;
          helpers.selectInstance(client, function (instance) {
            client.destroyDatabase('TestDatabase', instance, self.callback);
          });
        },
        "should respond correctly": function (err, response) {
          assert.isNull(err);
          assert.equal(response.statusCode, 202);
        }
      },
      "with last db": {
        topic: function () {
          var self = this;
          helpers.selectInstance(client, function (instance) {
            client.destroyDatabase('TestDatabaseTwo', instance, self.callback);
          });
        },
        "should respond correctly": function (err, response) {
          assert.isNull(err);
          assert.equal(response.statusCode, 202);
        }
      }
    }
  }
}).export(module);
