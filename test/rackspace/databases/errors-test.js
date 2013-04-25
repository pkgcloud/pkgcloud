///*
// * errors-test.js: Tests for Rackspace Cloud Database instances
// *
// * (C) 2010 Nodejitsu Inc.
// * MIT LICENSE
// *
// */
//
//var vows = require('vows'),
//    assert = require('../../helpers/assert'),
//    helpers = require('../../helpers');
//
//var client = helpers.createClient('rackspace', 'database');
//
//vows.describe('pkgcloud/rackspace/databases/errors').addBatch({
//  "The pkgcloud Rackspace Database client": {
//    "breaking the function": {
//      "createInstance() when no options": {
//        topic: function () {
//          client.createInstance(this.callback);
//        },
//        "should respond with errors": function (err, _) {
//          assert.assertError(err);
//        }
//      },
//      "createInstance() with bad options": {
//        topic: function () {
//          client.createInstance({}, this.callback);
//        },
//        "should respond with errors": function (err, _) {
//          assert.assertError(err);
//        }
//      },
//      "createInstance() with bad options": {
//        topic: function () {
//          client.createInstance({ name: 'shouldGetError' }, this.callback);
//        },
//        "should respond with errors": function (err, _) {
//          assert.assertError(err);
//        }
//      },
//      "destroyInstance() with no Instance": {
//        topic: function () {
//          client.destroyInstance(this.callback);
//        },
//        "should respond with errors": function (err, _) {
//          assert.assertError(err);
//        }
//      },
//      "getInstance() with no Instance": {
//        topic: function () {
//          client.getInstance(this.callback);
//        },
//        "should respond with errors": function (err, _) {
//          assert.assertError(err);
//        }
//      }
//    }
//  }
//}).addBatch({
//  "The pkgcloud Rackspace Database client": {
//    "breaking the function": {
//      "createDatabase() when no options" : {
//        topic: function () {
//          client.createDatabase(this.callback);
//        },
//        "should respond with errors": function (err, _) {
//          assert.assertError(err);
//        }
//      },
//      "createDatabases() with bad options": {
//        topic: function () {
//          client.createDatabase({ name: 'shouldGetError' }, this.callback);
//        },
//        "should respond with errors": function (err, _) {
//          assert.assertError(err);
//        }
//      },
//      "getDatabases() when no Instance": {
//        topic: function () {
//          client.getDatabases(this.callback);
//        },
//        "should respond with errors": function (err, _) {
//          assert.assertError(err);
//        }
//      },
//      "destroyDatabase() when no options": {
//        topic: function () {
//          client.destroyDatabase(this.callback);
//        },
//        "should respond with errors": function (err, _) {
//          assert.assertError(err);
//        }
//      },
//      "destroyDatabase() with no Instance": {
//        topic: function () {
//          client.destroyDatabase('shouldGetError', this.callback);
//        },
//        "should respond with errors": function (err, _) {
//          assert.assertError(err);
//        }
//      }
//    }
//  }
//}).addBatch({
//  "The pkgcloud Rackspace Database client": {
//    "breaking the function": {
//      "createUser() when no options": {
//        topic: function () {
//          return client.createUser(this.callback);
//        },
//        "should respond with errors": function(err, _) {
//          assert.assertError(err);
//        }
//      },
//      "createUser() with empty object": {
//        topic: function () {
//          client.createUser({}, this.callback);
//        },
//        "should respond with errors": function(err, _) {
//          assert.assertError(err);
//        }
//      },
//      "createUser() with no database or instance": {
//        topic: function () {
//          client.createUser({ username: 'testing', password: 'shouldFail' }, this.callback);
//        },
//        "should respond with errors": function(err, _) {
//          assert.assertError(err);
//        }
//      },
//      "createUser() with no instance": {
//        topic: function () {
//          client.createUser({ username: 'testing', password: 'shouldFail', database: 'none' }, this.callback);
//        },
//        "should respond with errors": function(err, _) {
//          assert.assertError(err);
//        }
//      },
//      "getUsers() with no Instance": {
//        topic: function () {
//          return client.getUsers();
//        },
//        "should respond with errors": assert.assertError
//      },
//      "destroyUser() with no Instance": {
//        topic: function () {
//          return client.destroyUser();
//        },
//        "should respond with errors": assert.assertError
//      },
//      "destroyUser() with no user": {
//        topic: function () {
//          client.destroyUser('shouldGetError', this.callback);
//        },
//        "should respond with errors": function (err, _) {
//          assert.assertError(err);
//        }
//      },
//      "enableRoot() with no Instance": {
//        topic: function () {
//          client.enableRoot(this.callback);
//        },
//        "should respond with errors": function (err, _) {
//          assert.assertError(err);
//        }
//      },
//      "rootEnabled() with no Instance": {
//        topic: function () {
//          client.rootEnabled(this.callback);
//        },
//        "should respond with errors": function (err, _) {
//          assert.assertError(err);
//        }
//      }
//    }
//  }
//}).export(module);
