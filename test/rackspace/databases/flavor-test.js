/*
 * flavor-test.js: Test for pkgcloud Rackspace database flavor requests
 * 
 * (C) 2010 Nodejitsu Inc.
 * 
 */

var vows = require('vows'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var testContext = {},
    client = helpers.createClient('rackspace', 'database');

vows.describe('pkgcloud/rackspace/database/flavors').addBatch({
  "The pkgcloud Rackspace database client": {
    "the getFlavors() method": {
      "with no details": {
        topic: function () {
          client.getFlavors(this.callback);
        },
        "should return the list of flavors": function (err, flavors) {
          testContext.flavors = flavors;
          assert.isNull(err);
          assert.isArray(flavors);
          flavors.forEach(function (flavor) {
            assert.assertFlavor(flavor);
          });
        }
      },
      "with details": {
        topic: function () {
          client.getFlavors(true, this.callback);
        },
        "should return the list of flavors with details": function (err, flavors) {
          assert.isNull(err);
          assert.isArray(flavors);
          flavors.forEach(function (flavor) {
            assert.assertFlavorDetails(flavor);
          });
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace database client": {
    "the getFlavor() method": {
      topic: function () {
        client.getFlavor(testContext.flavors[0].id, this.callback);
      },
      "should return a valid flavor": function (err, flavor) {
        assert.assertFlavorDetails(flavor);
      }
    }
  }
}).export(module);
