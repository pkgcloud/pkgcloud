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
    filed = require('filed'),
    assert = require('../../helpers/assert'),
    macros = require('../macros'),
    pkgcloud = require('../../../lib/pkgcloud'),
    helpers = require('../../helpers');

var client = helpers.createClient('rackspace', 'storage'),
    fixturesDir = path.join(__dirname, '..', '..', 'fixtures'),
    sampleData = fs.readFileSync(path.join(fixturesDir, 'fillerama.txt'), 'utf8'),
    testData = {};

vows.describe('pkgcloud/rackspace/storage/file').addBatch({
  "The pkgcloud Rackspace storage client": {
    "the addFile() method": {
      "with a filepath": {
        topic: function () {
          var ustream = client.addFile('test_container', {
            remote: 'file1.txt',
            local: path.join(fixturesDir, 'fillerama.txt')
          }, function () { });

          ustream.on('end', this.callback);
        },
        "should raise the `end` event": function () {
          assert.isTrue(true);
        }
      },
      "with a ReadStream instance": {
        topic: function () {
          var fileName = path.join(__dirname, '..', '..', 'fixtures', 'fillerama.txt'),
              readStream = fs.createReadStream(fileName),
              headers = { 'content-length': fs.statSync(fileName).size },
              ustream;

          ustream = client.addFile('test_container', {
            remote: 'file3.txt',
            stream: readStream,
            headers: headers
          }, function () { });

          ustream.on('end', this.callback);
        },
        "should raise the `end` event": function () {
          assert.isTrue(true);
        }
      },
      "when piped to": {
        topic: function () {
          var ustream = client.addFile('test_container', {
            remote: 'file2.txt'
          }, function () { });

          filed(path.join(fixturesDir, 'fillerama.txt')).pipe(ustream);
          ustream.on('end', this.callback)
        },
        "should raise the `end` event": function () {
          assert.isTrue(true);
        }
      }
    }
  }
})/*.addBatch({
  "The pkgcloud Rackspace storage client": {
    "the getFiles() method": {
      topic: function () {
        client.getFiles('test_container', this.callback);
      },
      "should return a valid list of files": function (err, files) {
        files.forEach(function (file) {
          helpers.assertFile(file);
        });
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace storage client": {
    "the getFile() method": {
      "for a file that exists": {
        topic: function () {
          client.getFile('test_container', 'file2.txt', this.callback);
        },
        "should return a valid StorageObject": function (err, file) {
          helpers.assertFile(file);
          testData.file = file;
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace storage client": {
    "an instance of StorageObject": {
      "the save() method": {
        topic: function () {
          var self = this;
          testData.file.save({ local: path.join(__dirname, 'fixtures', 'fillerama3.txt') }, function (err, filename) {
            if (err) {
              return self.callback(err);
            }

            fs.stat(filename, self.callback)
          });
        },
        "should write the file to the specified location": function (err, stats) {
          assert.isNull(err);
          assert.isNotNull(stats);
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace storage client": {
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
