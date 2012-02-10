/*
 * server-test.js: Tests for pkgcloud Joyent compute server requests
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */
var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var testData = {},
    testContext = {},
    client = helpers.createClient('joyent', 'compute');

vows.describe('pkgcloud/joyent/compute/images').addBatch({
  "The pkgcloud Joyent compute client": {
    "the getServer() method": {
      topic: function () {
        client.createServer(this.callback);
      },
      "should return a valid server": function (err, server) {
        client.getServer(server,function (err,response) {
          client.destroyServer(server, function(){});
          assert.isNull(err);
          assert.equal(response.id,server.id);
          assert.assertServerDetails(server);
        });
      }
    },
    "the destroyServer() method": {
      topic: function () {
        client.createServer(this.callback);
      },
      "should be able to annihilate a server": function (err, server) {
        client.destroyServer(server, function (err,response) {
          assert.isNull(err);
          assert.equal(server.id, response.ok);
        });
      }
    }
  }
})["export"](module);