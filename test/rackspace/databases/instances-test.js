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

var testContext = {};

if (process.env.NOCK) {
  nock('https://' + client.serversUrl)
    .get('/v1.0/537645/flavors/1')
      .reply(200, JSON.parse(helpers.loadFixture('rackspace/databaseFlavors.json')));

  nock('https://' + client.serversUrl)
    .post('/v1.0/537645/instances',
      "{\"instance\": { \
        \"name\":\"test-instance\", \
        \"flavorRef\":\"http://ord.databases.api.rackspacecloud.com/v1.0/537645/flavors/1\", \
        \"databases\":[],\"volume\":{\"size\":1}}}")
      .reply(200, JSON.parse(helpers.loadFixture('rackspace/createdDatabaseInstance.json')));

  nock('https://' + client.serversUrl)
    .get('/v1.0/537645/instances')
      .reply(200, JSON.parse(helpers.loadFixture('rackspace/databaseInstances.json')));

  nock('https://' + client.serversUrl)
    .get('/v1.0/537645/instances/detail')
      .reply(200, JSON.parse(helpers.loadFixture('rackspace/databaseInstancesDetails.json')));

  nock('https://' + client.serversUrl)
    .delete('/v1.0/537645/instances/37a7eb5b-3f92-41c5-afe7-670443faac15')
      .reply(202, "202 Accepted\n\nThe request is accepted for processing.\n\n   ");
}

function assertLinks (links) {
  assert.isArray(links);
  links.forEach(function (link) {
    assert.ok(link.href);
    assert.ok(link.rel);
  });
}

vows.describe('pkgcloud/rackspace/databases/instances').addBatch({
  "The pkgcloud Rackspace database client": {
    "the create() method": {
     topic: function () {
      var self = this;
       client.getFlavor(1, function (err, flavor) {
        client.createInstance({
          name: 'test-instance',
          flavor: flavor
        }, self.callback);
       });
     },
     "should return a valid instance": function (err, instance) {
      assert.isNull(err);
      assert.assertInstance(instance);
     },
     "should return the same name and flavor used": function (err, instance) {
      assert.isNull(err);
      assert.assertInstance(instance);
      assert.equal(instance.name, 'test-instance');
      assert.equal(instance.flavor.id, 1);
     }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace database client": {
    "the getInstances() method": {
      "with no details": {
        topic: function () {
          client.getInstances(this.callback);
        },
        "should return the list of instances": function (err, instances) {
          assert.isNull(err);
          assert.isArray(instances);
          assert.ok(instances.length > 0);
        },
        "should valid instance each item in the list": function (err, instances) {
          assert.isNull(err);
          instances.forEach(function (instance) {
            assert.assertInstance(instance);
          });
        }
      },
      "with details": {
        topic: function () {
          client.getInstances(this.callback);
        },
        "should return list status and details for all databases": function (err, instances) {
          assert.isNull(err);
          instances.forEach(function (instance) {
            assert.assertInstance(instance);
          });
        },
        "should have the extra info": function (err, instances) {
          assert.isNull(err);
          instances.forEach(function (instance) {
            assert.ok(instance.created);
            assert.ok(instance.hostname);
            assert.ok(instance.id);
            assert.ok(instance.updated);
            assert.isArray(instance.links);
            assert.isObject(instance.flavor);
          });
        },
        "should have correct flavor": function (err, instances) {
          assert.isNull(err);
          instances.forEach(function (instance) {
            assert.ok(instance.flavor.id);
            assertLinks(instance.flavor.links);
          });
        },
        "should have correct links": function (err, instances) {
          instances.forEach(function (instance) {
            assertLinks(instance.links);
          });
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace database client": {
    "the destroyInstance() method": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          testContext.Instance = instance;
          client.destroyInstance(testContext.Instance, self.callback);
        });
      },
      "should respond correctly": function (err, res) {
        assert.isNull(err);
        assert.equal(res.statusCode, 202);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace database client": {
    "the getInstance() method": {
      topic: function () {
        client.getInstance(testContext.Instance.id, this.callback);
      },
      "should response with details": function (err, instance) {
        assert.isNull(err);
        assert.ok(instance);
        assert.assertInstance(instance);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace database client": {
    "the create() method with erros": {
      topic: function () {
        client.createInstance(this.callback);
      },
      "should respond with errors": assert.assertError
    },
    "the create() method without flavor": {
      topic: function () {
        client.createInstance({ name: 'test-without-flavor' }, this.callback);
      },
      "should respond with errors": assert.assertError
    }
  }
}).export(module);
