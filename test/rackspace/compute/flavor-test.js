/*
 * flavor-test.js: Tests for rackspace cloudservers flavor requests
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
    testContext = {}, 
    client = helpers.createClient();
    
vows.describe('node-cloudservers/flavors').addBatch({
  "The node-cloudservers client": {
    "the getFlavors() method": {
      "with no details": {
        topic: function () {
          client.getFlavors(this.callback);
        },
        "should return the list of flavors": function (err, flavors) {
          testContext.flavors = flavors;
          flavors.forEach(function (flavor) {
            helpers.assertFlavor(flavor);
          });
        }
      },
      "with details": {
        topic: function () {
          client.getFlavors(true, this.callback);
        },
        "should return the list of flavors": function (err, flavors) {
          flavors.forEach(function (flavor) {
            helpers.assertFlavorDetails(flavor);
          });
        }
      }
    }
  }
}).addBatch({
  "The node-cloudservers client": {
    "the getFlavor() method": {
      topic: function () {
        client.getFlavor(testContext.flavors[0].id, this.callback);
      },
      "should return a valid flavor": function (err, flavor) {
        helpers.assertFlavorDetails(flavor);
      }
    }
  }
}).export(module);