/*
 * flavor-test.js: Test that should be common to all providers.
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers');

var testData    = {},
    testContext = {},
    clients     = {};

function batchOne (providerClient, providerName) {
  var name   = providerName   || 'rackspace',
      client = providerClient || rackspace,
      test   = {};

  test["The pkgcloud " + name + " compute client"] = {
    "the getFlavors() method": {
      "with no details": {
        topic: function () {
          client.getFlavors(this.callback);
        },
        "should return the list of flavors": function (err, flavors) {
          testContext.flavors = flavors;
          flavors.forEach(function (flavor) {
            assert.assertFlavor(flavor);
          });
        }
      }
    }
  };

  return test;
}

function batchTwo (providerClient, providerName) {
  var name   = providerName   || 'rackspace',
      client = providerClient || rackspace,
      test   = {};

  test["The pkgcloud " + name + " compute client"] = {
    "the getFlavor() method": {
      topic: function () {
        client.getFlavor(testContext.flavors[0].id, this.callback);
      },
      "should return a valid flavor": function (err, flavor) {
        assert.assertFlavor(flavor);
      }
    }
  };

  return test;
}


JSON.parse(fs.readFileSync(__dirname + '/../../configs/providers.json'))
  .forEach(function (provider) {
    clients[provider] = helpers.createClient(provider, 'compute');

    var client = clients[provider],
        nock   = require('nock');

    if (process.env.NOCK) {
      if (provider === 'joyent') {
        nock('https://' + client.serversUrl)
          .get('/' + client.account + '/packages')
            .reply(200, helpers.loadFixture('joyent/flavors.json'), {})
          .get('/' + client.account + '/packages/Small%201GB')
            .reply(200, helpers.loadFixture('joyent/flavor.json'), {});
      } else if (provider === 'rackspace') {
        nock('https://' + client.authUrl)
          .get('/v1.0')
          .reply(204, "",
            JSON.parse(helpers.loadFixture('rackspace/auth.json')));
        nock('https://' + client.serversUrl)
          .get('/v1.0/537645/flavors/detail.json')
            .reply(200, helpers.loadFixture('rackspace/serverFlavors.json'), {})
          .get('/v1.0/537645/flavors/1')
            .reply(200, helpers.loadFixture('rackspace/flavor.json'), {});
      } else if (provider === 'amazon') {
        // No need in nock here, all flavors are stored in provider's files
      } else if (provider === 'azure') {
        // No need in nock here, all flavors are stored in provider's files
      } else if (provider === 'openstack') {
        nock(client.authUrl)
          .post('/v2.0/tokens', "{\"auth\":{\"passwordCredentials\":{\"username\":\"MOCK-USERNAME\",\"password\":\"MOCK-PASSWORD\"}}}")
            .reply(200, helpers.loadFixture('openstack/initialToken.json'))
          .get('/v2.0/tenants')
            .reply(200, helpers.loadFixture('openstack/tenantId.json'))
          .post('/v2.0/tokens', "{\"auth\":{\"passwordCredentials\":{\"username\":\"MOCK-USERNAME\",\"password\":\"MOCK-PASSWORD\"},\"tenantId\":\"72e90ecb69c44d0296072ea39e537041\"}}")
            .reply(200, helpers.loadFixture('openstack/realToken.json'));

        nock('http://compute.myownendpoint.org:8774')
          .get('/v2/72e90ecb69c44d0296072ea39e537041/flavors/detail')
            .reply(200, helpers.loadFixture('openstack/flavors.json'))
          .get('/v2/72e90ecb69c44d0296072ea39e537041/flavors/detail')
            .reply(200, helpers.loadFixture('openstack/flavors.json'))
          .get('/v2/72e90ecb69c44d0296072ea39e537041/flavors/1')
            .reply(200, helpers.loadFixture('openstack/flavor1.json'))
      }
    }

    vows
      .describe('pkgcloud/common/compute/flavor [' + provider + ']')
      .addBatch(batchOne(clients[provider], provider, nock))
      .addBatch(batchTwo(clients[provider], provider, nock))
       ["export"](module);
  });
