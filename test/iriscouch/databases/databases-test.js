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

var client = helpers.createClient('iriscouch', 'database'),
    testContext = {};

vows.describe('pkgcloud/iriscouch/databases').addBatch({
  "The pkgcloud IrisCouch client": {
    "the create() method": {
      "with correct options": {
        topic: function () {
          client.create({
            subdomain: 'testDatabase',
            first_name: "Marak",
            last_name: "Squires",
            email: "marak.squires@gmail.com"
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
          "should respond with errors": assert.assertError,
        },
        "no email": {
          topic: function () {
            client.create({ subdomain:'testDatabase', first_name: "Marak", last_name: "Squires"}, this.callback);
          },
          "should respond with errors": assert.assertError
        },
        "no subdomain": {
          topic: function () {
            client.create({ email: "marak.squires@gmail.com", first_name: "Marak", last_name: "Squires"}, this.callback);
          },
          "should respond with errors": assert.assertError
        },
        "no names": {
          topic: function () {
            client.create({ email: "marak.squires@gmail.com", subdomain:'testDatabase'}, this.callback);
          },
          "should respond with errors": assert.assertError
        }
      }
    }
  }
}).export(module);
