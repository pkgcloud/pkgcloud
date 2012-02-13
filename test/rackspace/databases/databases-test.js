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

vows.describe('pkgcloud/rackspace/databases/databases').addBatch({
  "The pkgcloud Rackspace Database client": {
    "the getDatabases() method": {
      topic: function () {
        this.callback();
      },
      "should return list of databases by instance": function (err, list) {
        assert.isTrue(false);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the create() method": {
      topic: function () {
        this.callback();
      },
      "should return a recent database": function (err, database) {
        assert.isTrue(false);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the delete() method": {
      topic: function () {
        this.callback();
      },
      "should delete the database": function (err) {
        assert.isTrue(false);
      }
    }
  }
}).export(module);
