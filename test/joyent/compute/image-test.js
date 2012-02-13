/*
 * image-test.js: Tests for pkgcloud Joyent compute image requests
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var fs          = require('fs'),
    path        = require('path'),
    vows        = require('vows'),
    assert      = require('../../helpers/assert'),
    helpers     = require('../../helpers'),
    testData    = {},
    testContext = {},
    client      = helpers.createClient('joyent', 'compute');

if(process.env.NOCK) {
  nock    = require('nock');
  nock('https://' + client.config.serversUrl)
    .get('/' + client.config.account + '/machines?limit=0')
    .reply(200, "[]", {});
}

vows.describe('pkgcloud/joyent/compute/images').addBatch({
  "The pkgcloud Joyent compute client": {
    "the getServers() method": {
      "with limit one": {
        topic: function () {
          client.getServers({limit: 0}, this.callback);
        },
        "should return one server": function (err, servers) {
          assert.equal(servers.length, 0);
          assert.assertNock(nock);
        }
      }
    }
  }
})["export"](module);
