/*
 * authentication-test.js: Tests for rackspace cloudservers authentication
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    cloudservers = require('../lib/cloudservers'),
    helpers = require('./helpers');
    
var testData = {}, 
    client = helpers.createClient();
    
vows.describe('node-cloudservers/authentication').addBatch({
  "The node-cloudservers client": {
    "should have core methods defined": function () {
      assert.isObject(client.config.auth);
      assert.include(client.config.auth, 'username');
      assert.include(client.config.auth, 'apiKey');
      
      assert.isFunction(client.setAuth);
      assert.isFunction(client.getServer);
      assert.isFunction(client.getServers);
      assert.isFunction(client.createServer);
    },
    "the getVersion() method": {
      topic: function () {
        client.getVersion(this.callback);
      },
      "should return the proper version": function (versions) {
        assert.isArray(versions);
        assert.isFalse(versions.length == 0);
      }
    },
    "with a valid username and api key": {
      topic: function () {
        client.setAuth(this.callback);
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
        var badClient = cloudservers.createClient({ 
          "auth": {
            "username": "fake",
            "apiKey": "data"
          }
        });
        
        badClient.setAuth(this.callback);
      },
      "should respond with 401": function (err, res) {
        assert.equal(res.statusCode, 401);
      }
    }
  }
}).addBatch({
  "The node-cloudservers client": {
    "the getLimits() method": {
      topic: function () {
        client.getLimits(this.callback); 
      },
      "should return the proper limits": function (limits) {
        assert.isNotNull(limits);
        assert.include(limits, 'absolute');
        assert.include(limits, 'rate');
        assert.isArray(limits.rate);
      }
    }
  }
}).export(module);