/*
* databases-test.js: Tests for MongoLab databases service
*
* (C) 2012 Nodejitsu Inc.
* MIT LICENSE
*
*/

var vows = require('vows'),
    helpers = require('../../helpers'),
    assert = require('../../helpers/assert');

var client = helpers.createClient('mongolab', 'database'),
    testContext = {};

vows.describe('pkgcloud/mongolab/databases').addBatch({
  "The pkgcloud MongoLab client": {
    "the createAccount() method": {
      "with correct options": {
        topic: function () {
          client.createAccount({
            name: 'daniel',
            email: 'daniel@nodejitsu.com'
          }, this.callback);
        },
        "should respond correctly": function (err, response) {
          assert.isNull(err);
          assert.ok(response.account);
          assert.ok(response.account.username);
          assert.ok(response.account.email);
          assert.ok(response.account.password);
          assert.equal(response.account.email, 'daniel@nodejitsu.com');
          testContext.account = response.account;
        }
      },
      "with invalid options like": {
        "no options": {
          topic: function () {
            client.createAccount(this.callback);
          },
          "should respond with errors": assert.assertError
        },
        "invalid options": {
          topic: function () {
            client.createAccount({ invalid:'keys' }, this.callback);
          },
          "should respond with errors": assert.assertError
        },
        "no email": {
          topic: function () {
            client.createAccount({ name: 'testDatabase' }, this.callback);
          },
          "should respond with errors": assert.assertError
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud MongoLab client": {
    "the createDatabase() method": {
      "with correct options": {
        topic: function () {
          client.createDatabase({
            plan:'free',
            name:'testDatabase',
            owner: testContext.account.username
          }, this.callback)
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
        },
        "no plan": {
          topic: function () {
            client.createDatabase({ name:'testDatabase' }, this.callback);
          },
          "should respond with errors": assert.assertError
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud MongoLab client": {
    "the deleteAccount() method": {
      "with correct options": {
        topic: function () {
          client.deleteAccount(testContext.account.username, this.callback);
        },
        "should respond correctly": function (err, response) {
          assert.isNull(err);
          assert.equal(response.statusCode, 200);
        }
      },
      "with invalid options like": {
        "no name": {
          topic: function () {
            client.deleteAccount(this.callback);
          },
          "should respond with errors": assert.assertError
        }
      }
    }
  }
}).export(module);