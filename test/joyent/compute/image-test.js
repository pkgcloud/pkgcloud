/*
 * image-test.js: Tests for pkgcloud Joyent compute image requests
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var testData = {},
    testContext = {},
    client = helpers.createClient('joyent', 'compute');

vows.describe('pkgcloud/joyent/compute/images').addBatch({
  "The pkgcloud Joyent compute client": {
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
      },
      "with limit one": {
        topic: function () {
          client.getServers({limit: 0}, this.callback);
        },
        "should return one server": function (err, servers) {
          assert.equal(servers.length, 0);
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Joyent compute client": {
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
      },
      "with details": {
        topic: function () {
          client.getImages(true, this.callback);
        },
        "should return the list of images": function (err, images) {
          images.forEach(function (image) {
            assert.assertImageDetails(image);
          });
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Joyent compute client": {
    "the getImage() method": {
      topic: function () {
        client.getImage(testContext.images[0].id, this.callback);
      },
      "should return a valid image": function (err, image) {
        assert.assertImageDetails(image);
      }
    }
  }
})["export"](module);
