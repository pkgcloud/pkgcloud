/*
 * storage-object-test.js: Tests for uploading files to Rackspace Cloudfiles when not authenticated.
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var path = require('path'),
    vows = require('vows'),
    fs = require('fs'),
    assert = require('../../helpers/assert'),
    macros = require('../macros'),
    pkgcloud = require('../../../lib/pkgcloud'),
    helpers = require('../../helpers');

if (process.env.NOCK) {
  return;
}

var client = function () {
      return helpers.createClient('rackspace', 'storage')
    },
    fixturesDir = path.join(__dirname, '..', '..', 'fixtures'),
    sampleData = fs.readFileSync(path.join(fixturesDir, 'fillerama.txt'), 'utf8'),
    testData = {};

vows.describe('pkgcloud/rackspace/storage/file').addBatch(
  macros.shouldCreateContainer(
    client(),
    'test_storage_objects'
  )
).addBatch({
  "The pkgcloud Rackspace storage client": {
    "the upload() method": {
      "with a filepath": macros.upload.fullpath(client(), {
        container: 'test_storage_objects',
        remote: 'file1.txt',
        local: path.join(fixturesDir, 'fillerama.txt')
      }),
      "with a ReadStream instance": macros.upload.stream(
        client(),
        'test_storage_objects',
        path.join(fixturesDir, 'fillerama.txt'),
        'file3.txt'
      ),
      "when piped to": macros.upload.piped(
        client(),
        'test_storage_objects',
        path.join(fixturesDir, 'fillerama.txt'),
        'file2.txt'
      )
    }
  }
}).addBatch({
  "The pkgcloud Rackspace storage client": {
    "the getFiles() method": {
      topic: function () {
        client().getFiles('test_storage_objects', this.callback);
      },
      "should return a valid list of files": function (err, files) {
        files.forEach(function (file) {
          assert.assertFile(file);
        });
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace storage client": {
    "the getFile() method": {
      "for a file that exists": {
        topic: function () {
          client().getFile('test_storage_objects', 'file1.txt', this.callback);
        },
        "should return a valid File": function (err, file) {
          assert.assertFile(file);
          testData.file = file;
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace storage client": {
    "the download() method": {
      topic: function () {
        var that = this;
        var dstream = client().download({
          container: 'test_storage_objects',
          remote: 'file3.txt',
          local: path.join(__dirname, '..', '..', 'fixtures', 'test-download3.txt')
        }, function () { });
        
        dstream.on('end', function () {
          //
          // TODO: Check fs.stat on the file we just saved.
          //
          setTimeout(that.callback, 5000);
        });
      },
      "should write the file to the specified location": function (err, stats) {
        assert.isNull(err);
        //assert.isNotNull(stats);
      }
    }
  }
})/*.addBatch({
  "The pkgcloud Rackspace storage client": {
    "the destroyFile() method": {
      "for a file that exists": {
        topic: function () {
          client.destroyFile('test_storage_objects', 'file1.txt', this.callback);
        },
        "should return true": function (err, deleted) {
          assert.isTrue(deleted);
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace storage client": {
    "an instance of a StorageObject": {
      "the destroy() method": {
        "for a file that exists": {
          topic: function () {
            testData.file.destroy(this.callback);
          },
          "should return true": function (err, deleted) {
            assert.isTrue(deleted);
          }
        }
      }
    }
  }
})*/.export(module);
