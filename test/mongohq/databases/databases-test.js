/*
 * databases-test.js: Tests for MongoHQ databases service
 *
 * (C) 2012 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var vows = require('vows'),
    helpers = require('../../helpers'),
    assert = require('../../helpers/assert');

var client = helpers.createClient('mongohq', 'database'),
    testContext = {};

vows.describe('pkgcloud/mongohq/databases').addBatch({
  "The pkgcloud MongoHQ client": {
    "the create() method": {
      "with correct options": {
        topic: function () {
          client.createDatabase({
            plan: 'free',
            name: 'testDatabase'
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
            client.createDatabase(this.callback);
          },
          "should respond with errors": assert.assertError
        },
        "invalid options": {
          topic: function () {
            client.createDatabase({ invalid:'keys' }, this.callback);
          },
          "should respond with errors": assert.assertError
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud MongoHQ client": {
    "the destroy() method": {
      "with correct options": {
        topic: function () {
          client.deleteDatabase(testContext.databaseId, this.callback);
        },
        "should respond correctly": function (err, confirm) {
          assert.isNull(err);
          assert.equal(confirm, 'deleted');
        }
      },
      "without options": {
        topic: function () {
          client.deleteDatabase(this.callback);
        },
        "should respond with errors": assert.assertError
      }
    }
  }
}).export(module);
