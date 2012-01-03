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
    container = 'test_container',
    client = helpers.createClient(),
    sampleData = new Buffer(3 * 1024 * 1024),
    sampleFile = path.join(__dirname, '..', 'test', 'fixtures', 'bigfile.raw');

fs.writeFileSync(sampleFile, sampleData);

vows.describe('node-cloudfiles/storage-object/large').addBatch(
  helpers.requireAuth(client)
).addBatch({
  "The node-cloudfiles client": {
    "the addFile() method": {
      topic: function () {
        var ustream = client.addFile(container, {
          remote: 'bigfile.raw',
          local: sampleFile
        }, function () { });
        
        ustream.on('end', this.callback);
      },
      "should raise the `end` event": function () {
        assert.isTrue(true);
      }
    }
  }
}).addBatch({
  "The node-cloudfiles client": {
    "the getFiles() method": {
      topic: function () {
        client.getFiles(container, this.callback);
      },
      "should return a valid list of files": function (err, files) {
        assert.isNull(err);
        assert.ok(files.length >= 1);
        assert.ok(files.some(function (file) {
          return /bigfile.raw/.test(file.name);
        }));
      }
    }
  }
}).addBatch({
  "The node-cloudfiles client": {
    "the getFile() method": {
      "for a file that exists": {
        topic: function () {
          client.getFile(container, 'bigfile.raw', this.callback);
        },
        "should return a file with correct content": function (err, file) {
          assert.isNull(err);
          helpers.assertEqualBuffers(fs.readFileSync(file.local), sampleData);
        }
      }
    }
  }
}).addBatch({
  "The node-cloudfiles client": {
    "the destroyFile() method": {
      "for a file that exists": {
        topic: function () {
          client.destroyFile(container, 'bigfile.raw', this.callback);
          fs.unlinkSync(sampleFile);
        },
        "should return true": function (err, deleted) {
          assert.isNull(err);
          assert.isTrue(deleted);
        }
      }
    }
  }
}).export(module);
