/*
 * base-test.js: Test that should be common to all providers.
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var clients     = {},
    testContext = {},
    versions    = JSON.parse(helpers.loadFixture('versions.json'));

function batchOne (providerClient, providerName, nock) {
  var test   = {};

  test["The pkgcloud " + providerName + " storage client"] = {
    "the createContainer() method": {
      topic: function () {
        providerClient.createContainer('pkgcloud-test-container',
                                       this.callback);
      },
      "should return newly created container": function (err, container) {
        assert.isNull(err);
        assert.assertContainer(container);
        assert.assertNock(nock);

        testContext.container = container;
      }
    }
  };

  return test;
}

function batchTwo (providerClient, providerName, nock) {
  var test   = {};

  test["The pkgcloud " + providerName + " storage client"] = {
    "the getContainers() method": {
      "with no arguments": {
        topic: function () {
          providerClient.getContainers(this.callback);
        },
        "should contain just created container": function (err, containers) {
          assert.isNull(err);

          assert.ok(containers.some(function (container) {
            assert.assertContainer(container);
            return testContext.container.name === container.name;
          }));
          assert.assertNock(nock);
        }
      }
    }
  };

  return test;
}

function batchThree (providerClient, providerName, nock) {
  var test   = {};

  test["The pkgcloud " + providerName + " storage client"] = {
    "the upload() method": {
      "with container and filename as arguments": {
        topic: function () {
          var stream = providerClient.upload({
            container: testContext.container,
            remote: 'test-file.txt',
            headers: {
              'content-length': 5
            }
          }, this.callback);

          stream.write('hello');
          stream.end();
        },
        "should upload file successfuly": function (err, ok) {
          assert.isNull(err);
          assert.ok(ok);
          assert.assertNock(nock);

          testContext.file = { name: 'test-file.txt', size: 5 };
        }
      }
    }
  };

  return test;
}

function batchFour (providerClient, providerName, nock) {
  var test   = {};

  test["The pkgcloud " + providerName + " storage client"] = {
    "the download() method": {
      "with container and filename as arguments": {
        topic: function () {
          var stream = providerClient.download({
            container: testContext.container,
            remote: testContext.file.name
          }, this.callback);

          testContext.fileContents = '';
          stream.on('data', function (data) {
            testContext.fileContents += data;
          });
          stream.end();
        },
        "should download file successfuly": function (err, file) {
          assert.isNull(err);
          assert.assertFile(file);
          assert.assertNock(nock);

          assert.equal(file.name, testContext.file.name);
          assert.equal(testContext.fileContents, 'hello');
          assert.equal(file.size, testContext.fileContents.length);
        }
      }
    },
    "the getFile() method": {
      "with container and filename as arguments": {
        topic: function () {
          providerClient.getFile(
            testContext.container,
            testContext.file.name,
            this.callback
          );
        },
        "should retrieve file information successfully": function (err, file) {
          assert.isNull(err);
          assert.assertFile(file);
          assert.assertNock(nock);

          assert.equal(file.name, testContext.file.name);
          assert.equal(file.size, testContext.file.size);
        }
      }
    },
    "the getFiles() method": {
      "with container as argument": {
        topic: function () {
          providerClient.getFiles(testContext.container, false, this.callback);
        },
        "should return created file": function (err, files) {
          assert.isNull(err);

          assert.ok(files.some(function (file) {
            assert.assertFile(file);
            return testContext.file.name === file.name;
          }));
          assert.assertNock(nock);
        }
      }
    }
  };

  return test;
}

function batchFive (providerClient, providerName, nock) {
  var test   = {};

  test["The pkgcloud " + providerName + " storage client"] = {
    "the removeFile() method": {
      "with container and filename as arguments": {
        topic: function () {
          providerClient.removeFile(
            testContext.container,
            testContext.file.name,
            this.callback
          );
        },
        "should remove file": function (err, ok) {
          assert.isNull(err);
          assert.ok(ok);
        }
      }
    }
  };

  return test;
}

function batchSix (providerClient, providerName, nock) {
  var test   = {};

  test["The pkgcloud " + providerName + " storage client"] = {
    "the destroyContainer() method": {
      "with container as argument": {
        topic: function () {
          providerClient.destroyContainer(
            testContext.container,
            this.callback
          );
        },
        "should destroy container": function (err, ok) {
          assert.isNull(err);
          assert.ok(ok);
        }
      }
    }
  };

  return test;
}

function batchSeven (providerClient, providerName, nock) {
  var test   = {};

  test["The pkgcloud " + providerName + " storage client"] = {
    "the getContainers() method": {
      "without arguments": {
        topic: function () {
          providerClient.getContainers(this.callback);
        },
        "should not contain destroyed container": function (err, containers) {
          assert.isNull(err);
          assert.ok(containers.every(function (container) {
            return container.name !== testContext.container.name;
          }));
        }
      }
    }
  };

  return test;
}

JSON.parse(fs.readFileSync(__dirname + '/../../configs/providers.json'))
  .filter(function (provider) {
    return !!helpers.pkgcloud.providers[provider].storage;
  })
  .forEach(function (provider) {
    clients[provider] = helpers.createClient(provider, 'storage');

    var client = clients[provider],
        nock   = require('nock');

    if (process.env.NOCK) {
      if (provider === 'joyent') {
        return;
      } else if (provider === 'rackspace') {
        return;
      } else if (provider === 'amazon') {
        nock('https://pkgcloud-test-container.' + client.serversUrl)
          .put('/')
            .reply(200, '', {})
          .put('/test-file.txt', 'hello')
            .reply(200, '', {})
          .get('/test-file.txt')
            .reply(200, 'hello', { 'content-length': 5 })
          .head('/test-file.txt')
            .reply(200, '', { 'content-length': 5 })
          .get('/')
            .reply(200, helpers.loadFixture('amazon/list-bucket-files.xml'), {})
          .delete('/test-file.txt')
            .reply(204, '', {})
          .get('/')
            .reply(
              200,
              helpers.loadFixture('amazon/list-bucket-files2.xml'),
              {}
            )
          .delete('/')
            .reply(204, '', {});

        nock('https://' + client.serversUrl)
          .get('/')
            .reply(200, helpers.loadFixture('amazon/list-buckets.xml'), {})
          .get('/')
            .reply(200, helpers.loadFixture('amazon/list-buckets2.xml'), {});
      }
    }

    vows
      .describe('pkgcloud/common/storage [' + provider + ']')
      .addBatch(batchOne(clients[provider], provider, nock))
      .addBatch(batchTwo(clients[provider], provider, nock))
      .addBatch(batchThree(clients[provider], provider, nock))
      .addBatch(batchFour(clients[provider], provider, nock))
      .addBatch(batchFive(clients[provider], provider, nock))
      .addBatch(batchSix(clients[provider], provider, nock))
      .addBatch(batchSeven(clients[provider], provider, nock))
       ["export"](module);
  });
