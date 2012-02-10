/*
 * image-test.js: Test that should be common to all providers.
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
      "the getServers() method": {
        "with no details": {
          topic: function () {
            client.getServers(this.callback);
          },
          "should return the list of servers": function (err, servers) {
            testContext.servers = servers;
            servers.forEach(function (server) {
              assert.assertServer(server);
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
      "the getImages() method": {
        "with no details": {
          topic: function () {
            client.getImages(this.callback);
          },
          "should return the list of images": function (err, images) {
            testContext.images = images;
            images.forEach(function (image) {
              assert.assertImage(image);
            });
          }
        }
      }
    };

  return test;
}

function batchThree (providerClient, providerName) {
  var name   = providerName   || 'rackspace',
      client = providerClient || rackspace,
      test   = {};

  test["The pkgcloud " + name + " compute client"] =
    {
      "the getImage() method providing an id": {
        topic: function () {
          client.getImage(testContext.images[0].id, this.callback);
        },
        "should return a valid image": function (err, image) {
          assert.assertImageDetails(image);
        }
      },
      "the getImage() method providing an image": {
        topic: function () {
          client.getImage(testContext.images[0], this.callback);
        },
        "should return a valid image": function (err, image) {
          assert.assertImageDetails(image);
        }
      }
    };

  return test;
}

JSON.parse(fs.readFileSync(__dirname + '/../../configs/providers.json'))
  .forEach(function(provider) {
    clients[provider] = helpers.createClient(provider, 'compute');
    vows
      .describe('pkgcloud/common/compute/image [' + provider + ']')
      .addBatch(batchOne(clients[provider], provider))
      .addBatch(batchTwo(clients[provider], provider))
      .addBatch(batchThree(clients[provider], provider))
       ["export"](module);
  });