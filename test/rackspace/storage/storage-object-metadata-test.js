/*
 * container-test.js: Tests for Rackspace Cloudfiles containers
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var path = require('path'),
    vows = require('vows'),
    fs = require('fs'),
    assert = require('assert'),
    cloudfiles = require('../lib/cloudfiles'),
    helpers = require('./helpers');

var testData = {}, 
    client = helpers.createClient(), 
    sampleData = fs.readFileSync(path.join(__dirname, '..', 'test', 'fixtures', 'fillerama.txt')).toString();

vows.describe('node-cloudfiles/storage-object').addBatch({
  "The node-cloudfiles client": {
    "an instance of a Container object": {
      "the addFile() method": {
        topic: function () {
          var ustream = client.addFile('test_container', {
            remote: 'file1.txt',
            local: path.join(__dirname, '..', 'test', 'fixtures', 'fillerama.txt')
          }, function () { });
          
          ustream.on('end', this.callback)
        },
        "should raise the `end` event": function () {
          assert.isTrue(true);
        }
      }
    }
  }
}).addBatch({
  "The node-cloudfiles client": {
    "the getFile() method": {
      "for a file that exists": {
        topic: function () {
          client.getFile('test_container', 'file1.txt', this.callback);
        },
        "should return a valid StorageObject": function (err, file) {
          helpers.assertFile(file);
          testData.file = file;
        }
      }
    }
  }
})/*.addBatch({
  "The node-cloudfiles client": {
    "the addMetadata() method": {
      topic: function () {
        testData.file.addMetadata({ "ninja": "true" }, this.callback); 
      },
      "should response with true": function (err, added) {
        assert.isTrue(added);
      }
    }
  }
}).addBatch({
  "The node-cloudfiles client": {
    "the getMetadata() method": {
      topic: function () {
        testData.file.getMetadata(this.callback); 
      },
      "should response with true": function (err, added) {
        assert.isTrue(added);
      }
    }
  }
})*/.addBatch({
  "The node-cloudfiles client": {
    "the destroyFile() method": {
      "for a file that exists": {
        topic: function () {
          client.destroyFile('test_container', 'file1.txt', this.callback);
        },
        "should return true": function (err, deleted) {
          assert.isTrue(deleted);
        }
      }
    }
  }
}).export(module);
