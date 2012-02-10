/*
 * flavor-test.js: Test that should be common to all providers.
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var testData    = {},
    testContext = {},
    clients     = {};

function batchOne (providerClient, providerName) {
  var name   = providerName   || 'rackspace',
      client = providerClient || rackspace,
      test   = {};

  test["The pkgcloud " + name + " compute client"] = 
    {
      "the getFlavors() method": {
        "with no details": {
          topic: function () {
            client.getFlavors(this.callback);
          },
          "should return the list of flavors": function (err, flavors) {
            testContext.flavors = flavors;
            flavors.forEach(function (flavor) {
              assert.assertFlavor(flavor);
            });
          }
        },
        "with details": {
          topic: function () {
            client.getFlavors(client.config.username, this.callback);
          },
          "should return the list of flavors": function (err, flavors) {
            flavors.forEach(function (flavor) {
              assert.assertFlavorDetails(flavor);
            });
          }
        }
      }
    };

  return test;
}

function batchTwo (providerClient, providerName) {
  var name   = providerName   || 'rackspace',
      client = providerClient || rackspace,
      test   = {};

  test["The pkgcloud " + name + " compute client"] =
    {
      "the getFlavor() method": {
        topic: function () {
          client.getFlavor(testContext.flavors[0].id, this.callback);
        },
        "should return a valid flavor": function (err, flavor) {
          assert.assertFlavorDetails(flavor);
        }
      }
    };

  return test;
}


JSON.parse(fs.readFileSync(__dirname + '/../../configs/providers.json'))
  .forEach(function(provider) {
    clients[provider] = helpers.createClient(provider, 'compute');
    vows
      .describe('pkgcloud/common/compute/flavor [' + provider + ']')
      .addBatch(batchOne(clients[provider], provider))
      .addBatch(batchTwo(clients[provider], provider))
       ["export"](module);
  });