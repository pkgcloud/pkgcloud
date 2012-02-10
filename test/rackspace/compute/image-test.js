/*
 * image-test.js: Tests for pkgcloud Rackspace compute image requests
 *
 * (C) 2010 Nodejitsu Inc.
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
  }
}).addBatch({
  "The pkgcloud Rackspace compute client": {
    "the getImage() method": {
      topic: function () {
        client.getImage(testContext.images[0].id, this.callback);
      },
      "should return a valid image": function (err, image) {
        assert.assertImageDetails(image);
      }
    }
    /*, "the createImage() method": {
      "with a server id": {
        topic: function () {
          client.createImage('test-image-id', testContext.images[0].id, this.callback);
        },
        "should create a new image": function (image) {

        }
      },
      "with a server instance": {
        topic: function () {
          //cloudservers.createImage
        },
        "should create a new image": function (image) {

        }
      }
    }*/
  }
})["export"](module);
