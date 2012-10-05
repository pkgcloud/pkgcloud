/*
 * container-test.js: Tests for Rackspace Cloudfiles containers
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var path = require('path'),
    fs = require('fs'),
    vows = require('vows'),
    pkgcloud = require('../../../lib/pkgcloud'),
    macros = require('../macros'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var testData = {},
    client = helpers.createClient('rackspace', 'storage'),
    fixturesDir = path.join(__dirname, '..', '..', 'fixtures'),
    sampleData = fs.readFileSync(path.join(fixturesDir, 'fillerama.txt'), 'utf8');

if (process.env.NOCK) {
  return;
}

vows.describe('pkgcloud/rackspace/storage/containers').addBatch(
  macros.shouldCreateContainer(
    client, 
    'test_container'
  )
).addBatch(
  macros.shouldCreateContainer(
    client, 
    'test_container', 
    'when creating a container that already exists'
  )
).addBatch({
  "The pkgcloud Rackspace storage client": {
    "the getContainers() method": {
      topic: function () {
        client.getContainers(this.callback);
      },
      "should return a list of containers": function (err, containers) {
        assert.isArray(containers);
        assert.equal(containers.filter(function (container) {
          return /test_container/.test(container.name);
        }).length, 1);
        
        containers.forEach(function (container) {
          assert.assertContainer(container);
        });
      }
    },
    "the getContainer() method": {
      topic: function () {
        client.getContainer('test_container', this.callback);
      },
      "should return a valid container": function (err, container) {
        assert.assertContainer(container);
        testData.container = container;
      }
    }
  }
})/*.addBatch({
  "The pkgcloud Rackspace storage client": {
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
  "The pkgcloud Rackspace storage client": {
    "an instance of a Container object": {
      "the getFiles() method": {
        topic: function () {
          testData.container.getFiles(this.callback);
        },
        "should response with a list of files": function (err, files) {
          assert.isArray(files);
          assert.lengthOf(files, 1);
          assert.isArray(testData.container.files);
          assert.lengthOf(testData.container.files, 1);
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace storage client": {
    "an instance of a Container object": {
      "the getFiles(true) method": {
        topic: function () {
          testData.container.getFiles(true, this.callback);
        },
        "should response with a list of files with content": function (err, files) {
          assert.isArray(files);
          assert.lengthOf(files, 1);
          assert.isArray(testData.container.files);
          assert.lengthOf(testData.container.files, 1);
          assert.isNotNull(files[0].local);
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace storage client": {
    "an instance of a Container object": {
      "the getFiles(new RegExp(...)) method": {
        topic: function () {
          testData.container.getFiles(/^file/, this.callback);
        },
        "should response with a list of files with content": function (err, files) {
          assert.isArray(files);
          assert.lengthOf(files, 1);
          assert.isArray(testData.container.files);
          assert.lengthOf(testData.container.files, 1);
          assert.isTrue(/^file/.test(files[0].name));
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace storage client": {
    "an instance of a Container object": {
      "the getFiles(new RegExp(...) with no matches) method": {
        topic: function () {
          testData.container.getFiles(/^no_matches/, this.callback);
        },
        "should response with a empty list": function (err, files) {
          assert.isArray(files);
          assert.lengthOf(files, 0);
          assert.isArray(testData.container.files);
          assert.lengthOf(testData.container.files, 0);
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace storage client": {
    "an instance of a Container object": {
      "the getFiles([filenames]) method": {
        topic: function () {
          testData.container.getFiles(['file1.txt'], this.callback);
        },
        "should response with a list of files with content": function (err, files) {
          assert.isArray(files);
          assert.lengthOf(files, 1);
          assert.isArray(testData.container.files);
          assert.lengthOf(testData.container.files, 1);
          assert.equal(files[0].name, 'file1.txt');
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace storage client": {
    "an instance of a Container object": {
      "the getFiles([not-existing-filenames]) method": {
        topic: function () {
          testData.container.getFiles(['not-exists.txt'], this.callback);
        },
        "should response with a error": function (err, files) {
          assert.isArray(err);
          assert.lengthOf(err, 1);
          assert.instanceOf(err[0], Error);
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace storage client": {
    "an instance of a Container object": {
      "the removeFile() method": {
        topic: function () {
          testData.container.removeFile('file1.txt', this.callback);
        },
        "should response with true": function (err, removed) {
          assert.isTrue(removed);
        }
      }
    }
  }
})*/.addBatch(
  macros.shouldDestroyContainer(
    client,
    'test_container'
  )
).export(module);
