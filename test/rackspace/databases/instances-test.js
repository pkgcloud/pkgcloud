/*
 * instances-test.js: Tests for Rackspace Cloud Database instances
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var vows = require('vows'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var client = helpers.createClient('rackspace', 'database');

vows.describe('pkgcloud/rackspace/databases/instances').addBatch({
  "The pkgcloud Rackspace database client": {
    "the getInstances() method": {
      "with no details": {
        topic: function () {
          client.getInstances(this.callback);
        },
        "should return the list of instances": function (err, instances) {
          assert.isNull(err);
          console.log(instances);
          assert.isTrue(false);
        }
      },
      "with details": {
        topic: function () {
          client.getInstances(true, this.callback);
        },
        "should return list status and details for all databases": function (err, info) {
          assert.isNull(err);
          console.log('La info', info);
          assert.isTrue(false);
        }
      }
    }
  } 
}).addBatch({
  "The pkgcloud Rackspace database client": {
    "the create() method": {
     topic: function () {
      var self = this;
       client.getFlavor(1, function (err, flavor) {
        client.createInstance({
          name:'test-instance',
          flavor: flavor
        }, self.callback);
       });
     },
     "should return a valid instance": function(err, instance) {
      assert.isNull(err);
      assert.ok(instance.id);
      assert.isString(instance.name);
      assert.ok(instance.created);
      assert.ok(instance.updated);
      assert.isNumber(instance.size);
      assert.isArray(instance.links);
      assert.isObject(instance.flavor);
      assert.isArray(instance.flavor.links);
     },
     "should return the same name and flavor used": function (err, instance) {
      assert.isNull(err);
      assert.equal(instance.name, 'test-instance');
      assert.equal(instance.flavor.id, 1);
     }
    }
  }
}).export(module);
