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
  "The pkgcloud Rackspace User client": {
    "the createUser() method": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
            client.createUser({
              username: 'joeTest',
              password: 'joepasswd',
              database: 'TestDatabase',
              instance: instance
            }, self.callback);
        });
      },
      "should respond correctly": function (err, response) {
        assert.isNull(err);
        assert.ok(response);
        assert.equal(response.statusCode, 202);
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the getUsers() method": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.getUsers(instance, self.callback);
        });
      },
      "should get the list of users": function (err, users, response) {
        assert.isNull(err);
        assert.isArray(users);
        assert.ok(response);
        users.forEach(function (user) {
          assert.assertUser(user);
        });
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace Database client": {
    "the destroyUsers() method": {
      topic: function () {
        var self = this;
        helpers.selectInstance(client, function (instance) {
          client.destroyUser(instance, 'joeTest2', self.callback);
        });
      },
      "should respond correctly": function (err, response) {
        assert.isNull(err);
        assert.ok(response);
        assert.equal(response.statusCode, 202);
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