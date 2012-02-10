/*
 * image-test.js: Tests for pkgcloud Rackspace compute image requests
 *
 * (C) 2010-2012 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var testData = {},
    testContext = {},
    client = helpers.createClient('rackspace', 'compute');

vows.describe('pkgcloud/rackspace/compute/images').addBatch({
  "The pkgcloud Rackspace compute client": {
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
  }
}).addBatch({
  "The pkgcloud Rackspace compute client": {
    "the createImage() method": {
      "with a server id": {
        topic: function () {
          client.createImage(
            { name: 'test-img-id', 
              server:  testContext.servers[0].id
            }, this.callback);
        },
        "should create a new image": function (image) {
          client.destroyImage('test-img-id', function(){});
          assert.assertImage(image);
        }
      }
    }
  }
})["export"](module);