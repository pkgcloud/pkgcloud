/*
 * image-test.js: Tests for rackspace cloudservers image requests
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var assert = require('assert'),
    fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    cloudservers = require('../lib/cloudservers'),
    helpers = require('./helpers');

var testData = {};
    testContext = {},
    client = helpers.createClient();

vows.describe('node-cloudservers/images').addBatch({
  "The node-cloudservers client": {
    "the getServers() method": {
      "with no details": {
        topic: function () {
          client.getServers(this.callback);
        },
        "should return the list of servers": function (err, servers) {
          testContext.servers = servers;
          servers.forEach(function (server) {
            helpers.assertServer(server);
          });
        }
      }
    }
  }
}).addBatch({
  "The node-cloudservers client": {
    "the getImages() method": {
      "with no details": {
        topic: function () {
          client.getImages(this.callback);
        },
        "should return the list of images": function (err, images) {
          testContext.images = images;
          images.forEach(function (image) {
            helpers.assertImage(image);
          });
        }
      },
      "with details": {
        topic: function () {
          client.getImages(true, this.callback);
        },
        "should return the list of images": function (err, images) {
          images.forEach(function (image) {
            helpers.assertImageDetails(image);
          });
        }
      }
    }
  }
}).addBatch({
  "The node-cloudservers client": {
    "the getImage() method": {
      topic: function () {
        client.getImage(testContext.images[0].id, this.callback);
      },
      "should return a valid image": function (err, image) {
        helpers.assertImageDetails(image);
      }
    },
    /*"the createImage() method": {
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
}).export(module);