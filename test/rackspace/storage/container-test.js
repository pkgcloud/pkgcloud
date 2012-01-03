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
    assert = require('assert'),
    cloudfiles = require('../lib/cloudfiles'),
    helpers = require('./helpers');

var testData = {}, 
    client = helpers.createClient(),
    sampleData = fs.readFileSync(path.join(__dirname, '..', 'test', 'fixtures', 'fillerama.txt')).toString();

vows.describe('node-cloudfiles/containers').addBatch({
  "The node-cloudfiles client": {
    "the createContainer() method": {
      "when creating a container": {
        topic: function () {
          client.createContainer(new (cloudfiles.Container)(client, { name: 'test_container'}), this.callback);
        },
        "should return a valid container": function (err, container) {
          helpers.assertContainer(container);
        }
      },
      "when creating a CDN-enabled container": {
        topic: function () {
          client.createContainer(new (cloudfiles.Container)(client, {
            name: 'test_cdn_container',
            cdnEnabled: true
          }), this.callback);
        },
        "should return a valid cdn container": function (err, container) {
          helpers.assertCdnContainer(container);
        }
      }
    }
  }
}).addBatch({
  "The node-cloudfiles client": {
    "the createContainer() method": {
      "when creating a container that already exists": {
        topic: function () {
          client.createContainer(new (cloudfiles.Container)(client, { name: 'test_container' }), this.callback);
        },
        "should return a valid container": function (err, container) {
          helpers.assertContainer(container);
        }
      },
    },
    "the getContainers() method": {
      "when requesting non-CDN containers": {
        topic: function () {
          client.getContainers(this.callback); 
        },
        "should return a list of containers": function (err, containers) {
          assert.isArray(containers);
          assert.equal(helpers.countTestContainers(containers),2);
          containers.forEach(function (container) {
            helpers.assertContainer(container);
          });
        }
      },
      "when requesting CDN containers": {
        topic: function () {
          client.getContainers(true, this.callback); 
        },
        "should return a list of cdn containers": function (err, containers) {
          assert.isArray(containers);
          assert.equal(helpers.countTestContainers(containers), 1);
          containers.forEach(function (container) {
            helpers.assertCdnContainer(container);
          });
        }
      }
    },
    "the getContainer() method": {
      "when requesting non-CDN container": {
        topic: function () {
          client.getContainer('test_container', this.callback); 
        },
        "should return a valid container": function (err, container) {
          helpers.assertContainer(container);
          testData.container = container;
        }
      },
      "when requesting CDN container": {
        "with a valid CDN container": {
          topic: function () {
            client.getContainer('test_cdn_container', true, this.callback); 
          },
          "should return a valid cdn container": function (err, container) {
            helpers.assertCdnContainer(container);
          }
        },
        "with an invalid CDN container": {
          topic: function () {
            client.getContainer('test_container', true, this.callback); 
          },
          "should respond with an error": function (err, container) {
            assert.isNotNull(err);
          }
        }
      }
    }
  }
}).addBatch({
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
  "The node-cloudfiles client": {
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
  "The node-cloudfiles client": {
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
  "The node-cloudfiles client": {
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
  "The node-cloudfiles client": {
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
  "The node-cloudfiles client": {
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
  "The node-cloudfiles client": {
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
}).export(module);
