/*
 * flavor-test.js: Test for pkgcloud Rackspace database flavor requests
 * 
 * (C) 2010 Nodejitsu Inc.
 * 
 */

var vows = require('vows'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var client = helpers.createClient('rackspace', 'database');

vows.describe('pkgcloud/rackspace/database/flavors').addBatch({
  "The pkgcloud Rackspace database client": {
    "the getFlavors() method": {
      "with now details": {
        topic: function () {
          client.getFlavors(this.callback);
        },
        "should return the list of flavors": function (err, flavors) {
          assert.isNull(err);
          console.log(flavors);
          assert.isTrue(false);
        }
      },
      "with details": {
        topic: function () {
          client.getFlavors(true, this.callback);
        },
        "should return the list of flavors with details": function (err, flavors) {
          assert.isNull(err);
          console.log(flavors);
          assert.isTrue(false);
        }
      }
    }
  }
}).export(module);
