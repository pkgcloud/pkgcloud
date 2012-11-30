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

  var credentials = {
     username: client.config.username,
     key: client.config.apiKey
  };

  nock('https://' + client.authUrl)
    .post('/v1.1/auth', { "credentials": credentials })
      .reply(200, helpers.loadFixture('rackspace/token.json'));

  nock('https://ord.databases.api.rackspacecloud.com')
    .get('/v1.0/537645/flavors/1')
      .reply(200, helpers.loadFixture('rackspace/databaseFlavor1.json'))

    .post('/v1.0/537645/instances',
      "{\"instance\":{\"name\":\"test-instance\",\"flavorRef\":\"https://ord.databases.api.rackspacecloud.com/v1.0/537645/flavors/1\",\"databases\":[],\"volume\":{\"size\":1}}}")
      .reply(200, helpers.loadFixture('rackspace/createdDatabaseInstance.json'))

    .post('/v1.0/537645/instances',
      "{\"instance\":{\"name\":\"test-instance\",\"flavorRef\":\"https://ord.databases.api.rackspacecloud.com/v1.0/537645/flavors/1\",\"databases\":[],\"volume\":{\"size\":1}}}")
      .reply(200, helpers.loadFixture('rackspace/createdDatabaseInstance.json'))

    .get('/v1.0/537645/instances?limit=2')
      .reply(200, helpers.loadFixture('rackspace/databaseInstancesLimit2.json'))

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .delete('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f')
      .reply(202)

    .get('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f')
      .reply(200, helpers.loadFixture('rackspace/databaseInstanceShutdown.json'))

    .get('/v1.0/537645/instances?marker=55041e91-98ab-4cd5-8148-f3b3978b3262')
      .reply(200, helpers.loadFixture('rackspace/databaseInstanceOffset.json'))

    .get('/v1.0/537645/instances?limit=1&marker=55041e91-98ab-4cd5-8148-f3b3978b3262')
      .reply(200, helpers.loadFixture('rackspace/databaseInstanceLimitOffset.json'))

    .get('/v1.0/537645/flavors/1')
      .reply(200, helpers.loadFixture('rackspace/databaseFlavor1.json'))

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .post('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/action', "{\"restart\":{}}")
      .reply(202)

    .get('/v1.0/537645/flavors/2')
      .reply(200, helpers.loadFixture('rackspace/databaseFlavor2.json'))

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .get('/v1.0/537645/flavors/2')
      .reply(200, helpers.loadFixture('rackspace/databaseFlavor2.json'))

    .post('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/action',
      "{\"resize\":{\"flavorRef\":\"https://ord.databases.api.rackspacecloud.com/v1.0/537645/flavors/2\"}}")
      .reply(202)

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .get('/v1.0/537645/instances?')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))

    .post('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/action',
      "{\"resize\":{\"volume\":{\"size\":2}}}")
      .reply(202);
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
      "without options": {
        topic: function () {
          client.getInstances(this.callback);
        },
        "should return the list of instances": function (err, instances) {
          assert.isNull(err);
          assert.isArray(instances);
          assert.ok(instances.length > 0);
          testContext.instancesQuantity = instances.length;
        },
        "should valid instance each item in the list": function (err, instances) {
          assert.isNull(err);
          instances.forEach(function (instance) {
            assert.assertInstance(instance);
          });
        },
        "should response with extra info": function (err, instances) {
          assert.isNull(err);
          instances.forEach(function (instance) {
            assert.ok(instance.id);
            assert.isArray(instance.links);
            assert.isObject(instance.flavor);
            assert.isObject(instance.volume);
            assert.isNumber(instance.volume.size);
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
        },
        "should have a null offset": function (err, instances, offset) {
          assert.isNull(err);
          assert.ok(instances);
          assert.isNull(offset);
        }
      },
      "with limit": {
        topic: function () {
          client.getInstances({ limit: 2 }, this.callback);
        },
        "should respond at least 2 elements": function (err, instances) {
          assert.isNull(err);
          assert.isArray(instances);
          assert.equal(instances.length, 2);
        },
        "should pass as third argument the offset mark": function (err, instances, offset) {
          assert.isNull(err);
          assert.isNotNull(offset);
          assert.ok(offset);
          testContext.marker = offset;
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
    "the getInstances() method with offset": {
      topic: function () {
        client.getInstances({ offset: testContext.marker }, this.callback);
      },
      "should respond less quantity": function (err, instances, offset) {
        assert.isNull(err);
        assert.isArray(instances);
        assert.ok(instances.length >= 2
            && instances.length < testContext.instancesQuantity);
      }
    },
    "the getInstances() method with limit and offset": {
      topic: function () {
        client.getInstances({limit:1, offset: testContext.marker }, this.callback);
      },
      "should respond just one result with more next points": function (err, instances, offset) {
        assert.isNull(err);
        assert.isArray(instances);
        assert.equal(instances.length, 1);
        assert.ok(offset);
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
    },
    "the create() method with a incorrect size": {
      topic: function () {
        var self = this;
        client.getFlavor(1, function (err, flavor) {
          client.createInstance({
            name: 'test-instance',
            flavor: flavor,
            size: '1'
          }, self.callback);
        });
      },
      "should respond with errors": assert.assertError
    }
  }
}).addBatch({
  "The pkgcloud Rackspace database client": {
    "the restartInstance() method": {
      "with valid instance": {
        topic: function () {
          var self = this;
          helpers.selectInstance(client, function (instance) {
            client.restartInstance(instance, self.callback);
          });
        },
        "should respond correctly": function (err) {
          assert.isUndefined(err);
        }
      },
      "with no instance": {
        topic: function () {
          client.restartInstance(this.callback);
        },
        "should get errors": assert.assertError
      },
      "with no parameters": {
        topic: client.restartInstance,
        "should get errros": assert.assertError
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace database client": {
    "the setFlavor() method": {
      "without instance and flavor parameters": {
        topic: function () {
          client.setFlavor(this.callback);
        },
        "should get errors": assert.assertError
      },
      "whitout flavor parameter": {
        topic: function () {
          var self = this;
          helpers.selectInstance(client, function (instance) {
            client.setFlavor(instance, self.callback);
          });
        },
        "should get errors": assert.assertError
      },
      "whitout instance parameter": {
        topic: function () {
          var self = this;
          client.getFlavor(2, function (err, flavor) {
            if (!err && flavor) {
              client.setFlavor(flavor, self.callback);
            }
          })
        },
        "should get errors": assert.assertError
      },
      "with correct parameters": {
        topic: function () {
          var self = this;
          helpers.selectInstance(client, function (instance) {
            var newFlavor = (Number(instance.flavor.id) === 4) ? 1 : Number(instance.flavor.id) + 1;
            client.getFlavor(newFlavor, function (err, flavor) {
              if (!err && flavor) {
                client.setFlavor(instance, flavor, self.callback);
              }
            });
          });
        },
        "should respond correctly": function (err) {
          assert.isUndefined(err);
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace database client": {
    "the setVolumeSize() method": {
      "without instance and size parameters": {
        topic: function () {
          client.setVolumeSize(this.callback);
        },
        "should get errors": assert.assertError
      },
      "without size parameter": {
        topic: function () {
          var self = this;
          helpers.selectInstance(client, function (instance) {
            client.setVolumeSize(instance, self.callback);
          });
        },
        "should get errors": assert.assertError
      },
      "with invalid size parameter": {
        topic: function () {
          var self = this;
          helpers.selectInstance(client, function (instance) {
            client.setVolumeSize(instance, 12, self.callback);
          });
        },
        "should get errors": assert.assertError
      },
      "with correct parameters": {
        topic: function () {
          var self = this;
          helpers.selectInstance(client, function (instance) {
            var newSize = (Number(instance.volume.size) === 8) ? 1 : Number(instance.volume.size) + 1;
            client.setVolumeSize(instance, newSize, self.callback);
          });
        },
        "should respond correctly": function (err) {
          assert.isUndefined(err);
        }
      }
    }
  }
})
//
// Its better run the tests again for have instances already running.
// for the moment I will not clean up the instances at the end.
//
/**
.addBatch({
  "The pkgcloud Rackspace database client": {
    "destroying test instances": {
      topic: function () {
        var self  = this,
            async = require('async');
        client.getInstances(function (err, instances) {
          if (err) throw new Error(err);
          async.forEach(instances, function () {
            // I dont know why I have to do this for not lost the context of client.
            client.destroyInstance(arguments[0], arguments[1]);
          } , self.callback);
        })
      },
      "should complete without erros": function (err) {
        assert.isUndefined(err);
      }
    }
  }
})**/.export(module);
