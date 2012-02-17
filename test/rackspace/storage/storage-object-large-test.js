/*
 * container-test.js: Tests for Rackspace Cloudfiles containers
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

//var path = require('path'),
//    vows = require('vows'),
//    fs = require('fs'),
//    assert = require('assert'),
//    pkgcloud = require('../../../lib/pkgcloud'),
//    helpers = require('../../helpers');
//
//var container = 'test_container',
//    client = helpers.createClient('rackspace', 'storage'),
//    sampleData = new Buffer(3 * 1024 * 1024),
//    sampleFile = path.join(__dirname, '..', '..', 'fixtures', 'bigfile.raw'),
//    testData = {};
//
//fs.writeFileSync(sampleFile, sampleData);
//
//vows.describe('pkgcloud/rackspace/storage/file/large').addBatch({
//  "The pkgcloud Rackspace storage client": {
//    "the addFile() method": {
//      topic: function () {
//        console.error(client.addFile()()())
//        var ustream = client.addFile(container, {
//          remote: 'bigfile.raw',
//          local: sampleFile
//        }, function () { });
//
//        ustream.on('end', this.callback);
//      },
//      "should raise the `end` event": function () {
//        assert.isTrue(true);
//      }
//    }
//  }
//}).addBatch({
//  "The pkgcloud Rackspace storage client": {
//    "the getFiles() method": {
//      topic: function () {
//        client.getFiles(container, this.callback);
//      },
//      "should return a valid list of files": function (err, files) {
//        assert.isNull(err);
//        assert.ok(files.length >= 1);
//        assert.ok(files.some(function (file) {
//          return /bigfile.raw/.test(file.name);
//        }));
//      }
//    }
//  }
//}).addBatch({
//  "The pkgcloud Rackspace storage client": {
//    "the getFile() method": {
//      "for a file that exists": {
//        topic: function () {
//          client.getFile(container, 'bigfile.raw', this.callback);
//        },
//        "should return a file with correct content": function (err, file) {
//          assert.isNull(err);
//          helpers.assertEqualBuffers(fs.readFileSync(file.local), sampleData);
//        }
//      }
//    }
//  }
//}).addBatch({
//  "The pkgcloud Rackspace storage client": {
//    "the destroyFile() method": {
//      "for a file that exists": {
//        topic: function () {
//          client.destroyFile(container, 'bigfile.raw', this.callback);
//          fs.unlinkSync(sampleFile);
//        },
//        "should return true": function (err, deleted) {
//          assert.isNull(err);
//          assert.isTrue(deleted);
//        }
//      }
//    }
//  }
//}).export(module);
