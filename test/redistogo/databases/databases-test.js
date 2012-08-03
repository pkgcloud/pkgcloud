/*
 * databases-test.js: Tests for Redistogo databases service
 *
 * (C) 2012 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var vows = require('vows'),
    helpers = require('../../helpers'),
    assert = require('../../helpers/assert');

var client = helpers.createClient('redistogo', 'database'),
    testContext = {};

vows.describe('pkgcloud/redistogo/databases').addBatch({
  "The pkgcloud Redistogo client": {
    "the create() method": {
      "with correct options": {
        topic: function () {
          client.create({
            plan: 'nano',
          }, this.callback);
        },
        "should respond correctly": function (err, database) {
          assert.isNull(err);
          assert.ok(database.id);
          assert.ok(database.uri);
          assert.ok(database.username);
          assert.ok(database.password);
          testContext.databaseId = database.id;
        }
      },
      "with invalid options like": {
        "no options": {
          topic: function () {
            client.create(this.callback);
          },
          "should respond with errors": assert.assertError
        },
        "invalid options": {
          topic: function () {
            client.create({ invalid:'keys' }, this.callback);
          },
          "should respond with errors": assert.assertError
        },
        "no plan": {
          topic: function () {
            client.create({ name:'testDatabase' }, this.callback);
          },
          "should respond with errors": assert.assertError
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Redistogo client": {
    "the get() method": {
      "with correct options": {
        topic: function () {
          client.get(testContext.databaseId, this.callback);
        },
        "should respond correctly": function (err, database) {
          assert.isNull(err);
          assert.ok(database.id);
          assert.ok(database.uri);
          assert.ok(database.username);
          assert.ok(database.password);
        }
      },
      "without options": {
        topic: function () {
          client.get(this.callback);
        },
        "should respond with errors": assert.assertError
      }
    }
  }
}).addBatch({
  "The pkgcloud Redistogo client": {
    "the destroy() method": {
      "with correct options": {
        topic: function () {
          client.destroy({
            id: testContext.databaseId
          }, this.callback);
        },
        "should respond correctly": function (err, confirm) {
          assert.isNull(err);
          assert.equal(confirm, 'deleted');
        }
      },
      "without options": {
        topic: function () {
          client.create(this.callback);
        },
        "should respond with errors": assert.assertError
      }
    }
  }
}).export(module);
