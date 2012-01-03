/*
 * container-destroy-test.js: Tests for destroying Rackspace Cloudfiles containers
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    cloudfiles = require('../lib/cloudfiles'),
    helpers = require('./helpers');

var client = helpers.createClient();

vows.describe('node-cloudfiles/containers').addBatch({
  "The node-cloudfiles client": {
    "the destroyContainer() method": {
      "when deleting test_container": {
        topic: function () {
          client.destroyContainer('test_container', this.callback)
        },
        "should return true": function (err, success) {
          assert.isTrue(success);
        }
      },
      "when deleting test_cdn_container": {
        topic: function () {
          client.destroyContainer('test_cdn_container', this.callback)
        },
        "should return true": function (err, success) {
          assert.isTrue(success);
        }
      }
    }
  }
}).export(module);
