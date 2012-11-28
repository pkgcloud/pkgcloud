/*
 * create-server-test.js: Azure specific create server test
 *
 * (C) 2012 MSOpenTech Inc.
 *
 */

var fs = require('fs'),
  path = require('path'),
  vows = require('vows'),
  assert = require('../../../helpers/assert'),
  helpers = require('../../../helpers'),
  azureNock = require('../../../helpers/azureNock'),
  nock   = require('nock');

var options = {
  name: 'create-test-ids2',
  flavor: 'ExtraSmall',
  image: 'CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd'
};

function testCreateServer (client) {
  var name   = 'azure',
    test   = {};

  test["The pkgcloud " + name + " compute client"] = {
    "the createServer() method": {
      "with image and flavor ids": {
        topic: function () {
          client.createServer({
            name: options.name,
            image: options.image,
            flavor: options.flavor
          }, this.callback);
        },
        "should return a valid server": function (err, server) {

          testContext.server = server;
          assert.isNull(err);
          if(err === null) {
            assert.equal(server.name, options.name);
            assert.equal(server.imageId, options.image);
            assert.assertServerDetails(server);
          }
        }
      }
    }
  };

  return test;
}

function testSetWait (client) {
  var name   = 'azure',
    test   = {};

  test["The pkgcloud " + name + " compute client"] = {
    "the setWait() method": {
      "with setWait({ status: 'RUNNING' },": {
        topic: function () {
          testContext.server.setWait({ status: 'RUNNING' }, 1000, this.callback);
        },
        "should return a running server": function (err, server) {
          testContext.server = server;
          assert.isNull(err);
          if(err === null) {
            assert.equal(server.name, options.name);
            assert.equal(server.status, 'RUNNING');
            assert.equal(server.imageId, options.image);
            assert.assertServerDetails(server);
          }
        }
      }
    }
  };

  return test;
}

var client = helpers.createClient('azure', 'compute');

var testContext = {};

if (process.env.NOCK) {
  azureNock.serverTest(nock, helpers);
}

vows
  .describe('pkgcloud/azure/compute/createServer')
  .addBatch(testCreateServer(client))
  .addBatch(testSetWait(client))
  ["export"](module);





