/*
 * authentication-test.js: Tests for pkgcloud Rackspace storage authentication
 *
 * (C) 2010 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    pkgcloud = require('../../../lib/pkgcloud'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var testData = {},
    client = helpers.createClient('rackspace', 'storage');

vows.describe('pkgcloud/rackspace/storage/authentication').addBatch({
  "The pkgcloud Rackspace storage client": {
    "should have core methods defined": function () {
      assert.isObject(client.config.auth);
      assert.include(client.config.auth, 'username');
      assert.include(client.config.auth, 'apiKey');

      assert.isFunction(client.auth);
    },
    "the auth() method": {
      "with a valid username and api key": {
        topic: function () {
          client.auth(this.callback);
        },
        "should respond with 204 and appropriate headers": function (err, res) {
          assert.equal(res.statusCode, 204);
          assert.isObject(res.headers);
          assert.include(res.headers, 'x-server-management-url');
          assert.include(res.headers, 'x-storage-url');
          assert.include(res.headers, 'x-cdn-management-url');
          assert.include(res.headers, 'x-auth-token');
        },
        "should update the config with appropriate urls": function (err, res) {
          var config = client.config;
          assert.equal(res.headers['x-server-management-url'], config.serverUrl);
          assert.equal(res.headers['x-storage-url'], config.storageUrl);
          assert.equal(res.headers['x-cdn-management-url'], config.cdnUrl);
          assert.equal(res.headers['x-auth-token'], config.authToken);
        }
      },
      "with an invalid username and api key": {
        topic: function () {
          var badClient = helpers.createClient('rackspace', 'storage', {
            "auth": {
              "username": "fake",
              "apiKey": "data"
            }
          });

          badClient.auth(this.callback);
        },
        "should respond with 401": function (err, res) {
          assert.equal(res.statusCode, 401);
        }
      }
    }
  }
}).export(module);
