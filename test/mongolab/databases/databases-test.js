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
      },
      "with a custom password": {
        "without number character": {
          topic: function () {
            client.createAccount({
              name: 'custompassword',
              email: 'custom@password.com',
              password: 'mycustompassword'
            }, this.callback);
          },
          "should respond with errors": assert.assertError
        },
        "with number character": {
          topic: function () {
            client.createAccount({
              name: 'custompassword',
              email: 'custom@password.com',
              password: 'my1custom2password'
            }, this.callback);
          },
          "should respond with the defined password": function (err, response) {
            assert.isNull(err);
            assert.ok(response.account);
            assert.ok(response.account.username);
            assert.ok(response.account.email);
            assert.isUndefined(response.account.password);
            assert.equal(response.account.email, 'custom@password.com');
            testContext.custompw = response.account.username;
          }
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
    "the getDatabases() method": {
      "with correct options": {
        topic: function () {
          client.getDatabases(testContext.account.username, this.callback);
        },
        "should respond correctly": function (err, databases) {
          assert.isNull(err);
          assert.isArray(databases);
          assert.isObject(databases[0]);
          assert.equal(databases[0].name, testContext.account.username + '_testDatabase');
          testContext.databaseName = databases[0].name;
        }
      },
      "with invalid options like no name": {
        topic: function () {
          client.getDatabases(this.callback);
        },
        "should respond with errors": assert.assertError
      }
    }
  }
}).addBatch({
  "The pkgcloud MongoLab client": {
    "the getDatabase() method": {
      "with correct options":{
        topic: function () {
          client.getDatabase({
            name: testContext.databaseName,
            owner: testContext.account.username
          }, this.callback);
        },
        "should respond correctly": function (err, database) {
          // @todo Check for details like hostname, port, username, or password
          assert.isNull(err);
          assert.ok(database);
        }
      },
      "with invalid options like":{
        "no owner": {
          topic: function () {
            client.getDatabase({ name: testContext.databaseName }, this.callback);
          },
          "should respond with errors": assert.assertError
        },
        "no name": {
          topic: function () {
            client.getDatabase({ owner: testContext.account.username }, this.callback);
          },
          "should respond with errors": assert.assertError
        },
        "no options": {
          topic: function () {
            client.getDatabase(this.callback);
          },
          "should respond with errors": assert.assertError
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud MongoLab client": {
    "the deleteDatabase() method": {
      "with correct options": {
        topic: function () {
          client.deleteDatabase({
            name: testContext.databaseName,
            owner: testContext.account.username
          }, this.callback);
        },
        "should respond correctly": function (err) {
          assert.isUndefined(err);
        },
        "should have no databases": {
          topic: function () {
            client.getDatabases(testContext.account.username, this.callback);
          },
          "empty response": function (err, databases) {
            assert.isNull(err);
            assert.isEmpty(databases);
          }
        }
      },
      "with invalid options like": {
        "no owner": {
          topic: function () {
            client.deleteDatabase({ name: testContext.databaseName }, this.callback);
          },
          "should respond with errors": assert.assertError
        },
        "no name": {
          topic: function () {
            client.deleteDatabase({ owner: testContext.account.username }, this.callback);
          },
          "should respond with errors": assert.assertError
        },
        "no options": {
          topic: function () {
            client.deleteDatabase(this.callback);
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
        "should respond correctly": function (err) {
          assert.isUndefined(err);
        }
      },
      "with invalid options like": {
        "no name": {
          topic: function () {
            client.deleteAccount(this.callback);
          },
          "should respond with errors": assert.assertError
        }
      },
      "other account with correct options": {
        topic: function () {
          client.deleteAccount(testContext.custompw, this.callback);
        },
        "should respond correctly": function (err) {
          assert.isUndefined(err);
        }
      }
    }
  }
}).export(module);