/*
 * instances-test.js: Tests for Rackspace Cloud Database instances
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var vows = require('vows'),
    assert = require('../../helpers/assert'),
    nock = require('nock'),
    helpers = require('../../helpers');

var client = helpers.createClient('rackspace', 'database');

if (process.env.NOCK) {
  nock('https://' + client.serversUrl)
    .get('/v1.0/537645/instances')
      .reply(200, JSON.parse(helpers.loadFixture('rackspace/databaseInstances.json')));

  nock('https://' + client.serversUrl)
    .delete('/v1.0/537645/instances/aa21dcee-141b-4e5e-a231-01acf985f259/databases/TestDatabase')
      .reply(202, "202 Accepted\n\nThe request is accepted for processing.\n\n   ");

  nock('https://' + client.serversUrl)
    .post('/v1.0/537645/instances/aa21dcee-141b-4e5e-a231-01acf985f259/databases',
      "{\"databases\":[{\"name\":\"TestDatabase\"}]}")
      .reply(202, "202 Accepted\n\nThe request is accepted for processing.\n\n   ");
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
        client.createDatabase({name:'NotCreated'}, this.callback);
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
          client.getDatabases(instance, self.callback);
        });
      },
      "should return a list of databases": function (err, list, response) {
        assert.isNull(err);
        assert.isArray(list);
        assert.ok(list.length > 0);
        assert.equal(response.statusCode, 200);
      },
      "the list should have names": function (err, list, response) {
        assert.ok(list[0]);
        assert.ok(list[0].name);
        assert.isString(list[0].name);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the destroyDatabase() method": {
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
    }
  }
}).export(module);
