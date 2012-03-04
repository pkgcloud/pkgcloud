/*
 * users-test.js: Tests for Rackspace Cloud Database users within an instace
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var vows = require('vows'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var client = helpers.createClient('rackspace', 'database');

vows.describe('pkgcloud/rackspace/databases/users').addBatch({
  "The pkgcloud Rackspace Database client": {
    "the createUser() method": {
      topic: function () {
        this.callback();
      },
      "should respond correctly": function (err, response) {
        assert.ok(false);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the getUsers() method": {
      topic: function () {
        this.callback();
      },
      "should get the list of users": function (err, list) {
        assert.ok(false);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the destroyUsers() method": {
      topic: function () {
        this.callback();
      },
      "should respond correctly": function (err, list) {
        assert.ok(false);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the enableRoot() method": {
      topic: function () {
        this.callback();
      },
      "should respond correctly": function (err, list) {
        assert.ok(false);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the disableRoot() method": {
      topic: function () {
        this.callback();
      },
      "should respond correctly": function (err, list) {
        assert.ok(false);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the rootEnabled() method": {
      topic: function () {
        this.callback();
      },
      "should respond correctly": function (err, list) {
        assert.ok(false);
      }
    }
  }
}).export(module);