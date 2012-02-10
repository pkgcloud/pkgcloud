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

function findImage(name) {
  for (var i = 0; i < testContext.images.length; i++) {
    if (testContext.images[i].name === name) {
      return testContext.images[i];
    }
  }
}

function findFlavor(name) {
  for (var i = 0; i < testContext.flavors.length; i++) {
    if (testContext.flavors[i].name === name) {
      return testContext.flavors[i];
    }
  }
}

function batchOne (providerClient, providerName) {
  var name   = providerName   || 'rackspace',
      client = providerClient || rackspace,
      test   = {};

  test["The pkgcloud " + name + " compute client"] = 
    {
      "the getImages() method": {
        "with details": {
          topic: function () {
            client.getImages(true, this.callback);
          },
          "should return the list of images": function (err, images) {
            assert.isNull(err);
            testContext.images = images;
            images.forEach(function (image) {
              assert.assertImageDetails(image);
            });
          }
        }
      },
      "the getFlavors() method": {
        "with details": {
          topic: function () {
            client.getFlavors(true, this.callback);
          },
          "should return the list of flavors": function (err, flavors) {
            assert.isNull(err);
            testContext.flavors = flavors;
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
      "the create() method": {
        "not specifying any opts": {
          topic: function () {
            client.createServer({}, this.callback);
          },
          "should return a valid server": function (err, server) {
            client.destroyServer(server, function(){});
            assert.isNull(err);
            assert.assertServerDetails(server);
          }
        },
        "without image and flavor ids": {
          topic: function () {
            client.createServer({name: 'create-test-ids'},this.callback);
          },
          "should return a valid named server": function (err, server) {
            client.destroyServer(server, function(){});
            assert.isNull(err);
            assert.equal(server.name, 'create-test-ids');
            assert.assertServerDetails(server);
          }
        },
        "with image and flavor ids a second time": {
          topic: function () {
            client.createServer({
              name: 'create-test-ids2',
              image: testContext.images[0].id,
              flavor: testContext.flavors[0].id
            }, this.callback);
          },
          "should return a valid server": function (err, server) {
            client.destroyServer(server, function(){});
            assert.isNull(err);
            assert.equal(server.name, 'create-test-ids2');
            //assert.equal(server.imageId, testContext.images[0].id);
            assert.assertServerDetails(server);
          }
        },
        "with image and flavor instances": {
          topic: function () {
            var image = findImage(testContext.images[0].id),
                flavor = findFlavor(testContext.flavors[0].id);

            client.createServer({
              name: 'create-test-objects',
              image: image,
              flavor: flavor
            }, this.callback);
          },
          "should return a valid server": function (err, server) {
            client.destroyServer(server, function(){});
            assert.isNull(err);
            //assert.equal(server.imageId, testContext.images[0].id);
            assert.equal(server.name, 'create-test-objects');
            assert.assertServerDetails(server);
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
      "the getServers() method": {
        topic: function () {
          client.getServers(this.callback);
        },
        "should return the list of servers": function (err, servers) {
          assert.isNull(err);
          testContext.servers = servers;
          servers.forEach(function (server) {
            assert.assertServer(server);
          });
        }
      }
    };

  return test;
}

JSON.parse(fs.readFileSync(__dirname + '/../../configs/providers.json'))
  .forEach(function(provider) {
    clients[provider] = helpers.createClient(provider, 'compute');
    vows
      .describe('pkgcloud/common/compute/server [' + provider + ']')
      .addBatch(batchOne(clients[provider], provider))
      .addBatch(batchTwo(clients[provider], provider))
      .addBatch(batchThree(clients[provider], provider))
       ["export"](module);
  });