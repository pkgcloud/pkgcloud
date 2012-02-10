/*
 * flavor-test.js: Tests for pkgcloud Rackspace compute flavor requests
 *
 * (C) 2010 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var testData = {},
    testContext = {},
    client = helpers.createClient('rackspace', 'compute');

vows.describe('pkgcloud/rackspace/compute/flavors').addBatch({
  "The pkgcloud Rackspace compute client": {
    "the getFlavors() method": {
      "with no details": {
        topic: function () {
          client.getFlavors(this.callback);
        },
        "should return the list of flavors": function (err, flavors) {
          testContext.flavors = flavors;
          flavors.forEach(function (flavor) {
            assert.assertFlavor(flavor);
          });
        }
      },
      "with details": {
        topic: function () {
          client.getFlavors(this.callback);
        },
        "should return the list of flavors": function (err, flavors) {
          flavors.forEach(function (flavor) {
            assert.assertFlavorDetails(flavor);
          });
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace compute client": {
    "the getFlavor() method": {
      topic: function () {
        client.getFlavor(testContext.flavors[0].id, this.callback);
      },
      "should return a valid flavor": function (err, flavor) {
        assert.assertFlavorDetails(flavor);
      }
    }
  }
})["export"](module);
