/*
 * image-test.js: Tests for pkgcloud Rackspace compute image requests
 *
 * (C) 2010-2012 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    nock = require('nock'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers'),
    testData = {},
    testContext = {},
    client = helpers.createClient('rackspace', 'compute');

if (process.env.NOCK) {
  nock('https://' + client.authUrl)
    .get('/v1.0')
    .reply(204, "",  JSON.parse(helpers.loadFixture('rackspace/auth.json')));

  nock('https://' + client.serversUrl)
    .get('/v1.0/537645/servers/detail.json')
      .reply(204, helpers.loadFixture('rackspace/servers.json'), {})
    .post('/v1.0/537645/images', JSON.stringify({"image": {"name": "test-img-id", "serverId": 20578901 } }))
      .reply(202, helpers.loadFixture('rackspace/queued_image.json'), {})
    ["delete"]('/v1.0/537645/images/18753753')
      .reply(204, "", {});
}

vows.describe('pkgcloud/rackspace/compute/images').addBatch({
  "The pkgcloud Rackspace compute client": {
    "the getServers() method": {
      "with no details": {
        topic: function () {
          client.getServers(this.callback);
        },
        "should return the list of servers": function (err, servers) {
          testContext.servers = servers;
          servers.forEach(function (server) {
            assert.assertServer(server);
          });
          assert.assertNock(nock);
        }
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace compute client": {
    "the createImage() method": {
      "with a server id": {
        topic: function () {
          client.createImage({ name: 'test-img-id', 
            server:  testContext.servers[0].id
          }, this.callback);
        },
        "should create a new image": function (image) {
          client.destroyImage(image, function () {});
          assert.assertImage(image);
          assert.assertNock(nock);
        }
      }
    }
  }
})["export"](module);