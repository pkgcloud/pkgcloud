/*
 * container-test.js: Tests for Rackspace Cloudfiles containers
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

//
//var path = require('path'),
//    vows = require('vows'),
//    fs = require('fs'),
//    assert = require('assert'),
//    pkgcloud = require('../../../lib/pkgcloud'),
//    helpers = require('../../helpers');
//
//var client = helpers.createClient('rackspace', 'storage'),
//    fixturesDir = path.join(__dirname, '..', '..', 'fixtures'),
//    sampleData = fs.readFileSync(path.join(fixturesDir, 'fillerama.txt'), 'utf8'),
//    testData = {};
//
//vows.describe('pkgcloud/rackspace/storage/file/metadata').addBatch({
//  "The pkgcloud Rackspace storage client": {
//    "an instance of a Container object": {
//      "the upload() method": {
//        topic: function () {
//          var ustream = client.addFile('test_container', {
//            remote: 'file1.txt',
//            local: path.join(__dirname, '..', 'test', 'fixtures', 'fillerama.txt')
//          }, function () { });
//
//          ustream.on('end', this.callback)
//        },
//        "should raise the `end` event": function () {
//          assert.isTrue(true);
//        }
//      }
//    }
//  }
//}).addBatch({
//  "The pkgcloud Rackspace storage client": {
//    "the getFile() method": {
//      "for a file that exists": {
//        topic: function () {
//          client.getFile('test_container', 'file1.txt', this.callback);
//        },
//        "should return a valid StorageObject": function (err, file) {
//          helpers.assertFile(file);
//          testData.file = file;
//        }
//      }
//    }
//  }
//})/*.addBatch({
//  "The pkgcloud Rackspace storage client": {
//    "the addMetadata() method": {
//      topic: function () {
//        testData.file.addMetadata({ "ninja": 'true' }, this.callback);
//      },
//      "should response with true": function (err, added) {
//        assert.isTrue(added);
//      }
//    }
//  }
//}).addBatch({
//  "The pkgcloud Rackspace storage client": {
//    "the getMetadata() method": {
//      topic: function () {
//        testData.file.getMetadata(this.callback);
//      },
//      "should response with true": function (err, added) {
//        assert.isTrue(added);
//      }
//    }
//  }
//})*/.addBatch({
//  "The pkgcloud Rackspace storage client": {
//    "the destroyFile() method": {
//      "for a file that exists": {
//        topic: function () {
//          client.destroyFile('test_container', 'file1.txt', this.callback);
//        },
//        "should return true": function (err, deleted) {
//          assert.isTrue(deleted);
//        }
//      }
//    }
//  }
//}).export(module);
