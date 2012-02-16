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

  test["The pkgcloud " + name + " compute client"] = 
    {
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

  test["The pkgcloud " + name + " compute client"] =
    {
      "the getFlavor() method": {
        topic: function () {
          client.getFlavor(testContext.flavors[0].id, this.callback);
        },
        "should return a valid flavor": function (err, flavor) {
          assert.assertFlavorDetails(flavor);
        }
      }
    };

  return test;
}


JSON.parse(fs.readFileSync(__dirname + '/../../configs/providers.json'))
  .forEach(function(provider) {
    clients[provider] = helpers.createClient(provider, 'compute');
    var client = clients[provider],
        nock   = require('nock');
    if(process.env.NOCK) {
      if(provider === 'joyent') {
        nock('https://' + client.config.serversUrl)
          .get('/' + client.config.account + '/packages')
            .reply(200, helpers.loadFixture('joyent/flavors.json'), {})
          .get('/' + client.config.account + '/packages/Small%201GB')
            .reply(200, helpers.loadFixture('joyent/flavor.json'), {});
      } else if(provider === 'rackspace') {
        nock('https://' + client.authUrl)
          .get('/v1.0')
          .reply(204, "", {
            'x-storage-url'         : 'https://storage101.ord1.clouddrive.com/v1/' +   
              'MossoCloudFS_9198ca47-40e2-43e4-838b-8abea03a9b41',
            'x-auth-token'          : 'eec97af1-c574-4f9f-8c1f-642fa7979023',
            'x-storage-token'       : 'eec97af1-c574-4f9f-8c1f-642fa7979023',
            'x-server-management-url': 
              'https://servers.api.rackspacecloud.com/v1.0/537645',
            'x-cdn-management-url'  : 'https://cdn2.clouddrive.com/v1/'+
              'MossoCloudFS_9198ca47-40e2-43e4-838b-8abea03a9b41' });
        nock('https://' + client.serversUrl)
          .get('/v1.0/537645/flavors/detail.json')
            .reply(200, helpers.loadFixture('rackspace/flavors.json'), {})
          .get('/v1.0/537645/flavors/1')
            .reply(200, helpers.loadFixture('rackspace/flavor.json'), {});
      }
    }
    vows
      .describe('pkgcloud/common/compute/flavor [' + provider + ']')
      .addBatch(batchOne(clients[provider], provider, nock))
      .addBatch(batchTwo(clients[provider], provider, nock))
       ["export"](module);
  });