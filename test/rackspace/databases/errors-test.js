/*
 * errors-test.js: Tests for Rackspace Cloud Database instances
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
    "breaking the function": {
      "createInstance() when no options": {
        topic: function () {
          client.createInstance(this.callback);
        },
        "should respond with errors": assert.assertError
      },
      "createInstance() with bad options": {
        topic: function () {
          client.createInstance({}, this.callback);
        },
        "should respond with errors": assert.assertError
      },
      "createInstance() with bad options": {
        topic: function () {
          client.createInstance({ name: 'shouldGetError' }, this.callback);
        },
        "should respond with errors": assert.assertError
      },
      "destroyInstance() with no Instance": {
        topic: function () {
          client.destroyInstance(this.callback);
        },
        "should respond with errors": assert.assertError
      },
      "getInstance() with no Instance": {
        topic: function () {
          client.getInstance(this.callback);
        },
        "should respond with errors": assert.assertError
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "breaking the function": {
      "createDatabase() when no options" : {
        topic: function () {
          client.createDatabase(this.callback);
        },
        "should respond with errors": assert.assertError
      },
      "createDatabases() with bad options": {
        topic: function () {
          client.createDatabase({ name: 'shouldGetError' }, this.callback);
        },
        "should respond with errors": assert.assertError
      },
      "getDatabases() when no Instance": {
        topic: function () {
          client.getDatabases(this.callback);
        },
        "should respond with errors": assert.assertError
      },
      "destroyDatabase() when no options": {
        topic: function () {
          client.destroyDatabase(this.callback);
        },
        "should respond with errors": assert.assertError
      },
      "destroyDatabase() with no Instance": {
        topic: function () {
          client.destroyDatabase('shouldGetError', this.callback);
        },
        "should respond with errors": assert.assertError
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "breaking the function": {
      "createUser() when no options": {
        topic: function () {
          client.createUser(this.callback);
        },
        "should respond with errors": assert.assertError
      },
      "createUser() whit bad options": {
        topic: function () {
          client.createUser({}, this.callback);
        },
        "should respond with errors": assert.assertError
      },
      "createUser() whit bad options": {
        topic: function () {
          client.createUser({ username: 'testing', password: 'shouldFail' }, this.callback);
        },
        "should respond with errors": assert.assertError
      },
      "createUser() whit bad options": {
        topic: function () {
          client.createUser({ username: 'testing', password: 'shouldFail', database: 'none' }, this.callback);
        },
        "should respond with errors": assert.assertError
      },
      "getUsers() whit no Instance": {
        topic: function () {
          client.getUsers(this.callback);
        },
        "should respond with errors": assert.assertError
      },
      "destroyUser() whit no Instance": {
        topic: function () {
          client.destroyUser(this.callback);
        },
        "should respond with errors": assert.assertError
      },
      "destroyUser() whit no user": {
        topic: function () {
          client.destroyUser('shouldGetError', this.callback);
        },
        "should respond with errors": assert.assertError
      },
      "enableRoot() whit no Instance": {
        topic: function () {
          client.enableRoot(this.callback);
        },
        "should respond with errors": assert.assertError
      },
      "rootEnabled() whit no Instance": {
        topic: function () {
          client.rootEnabled(this.callback);
        },
        "should respond with errors": assert.assertError
      }
    }
  }
}).export(module);
