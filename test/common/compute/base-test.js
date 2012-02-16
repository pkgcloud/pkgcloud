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

var clients     = {},
    versions    = JSON.parse(helpers.loadFixture('versions.json'));

function batchOne (providerClient, providerName) {
  var name   = providerName   || 'rackspace',
      client = providerClient || rackspace,
      test   = {};

  test["The pkgcloud " + name + " compute client"] = 
    {
      "the getVersion() method": {
        "with no arguments": {
          topic: function () {
            client.getVersion(this.callback);
          },
          "should return the version": function (err, version) {
            assert.ok(typeof version === 'string');
            if(version!==versions[name]) {
              console.error(
                '!! API Version for ' + name + ' is ' + version + '.'+
                ' we were expecting it to be ' + versions[name]);
            }
          }
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
          .get('/nodejitsu1/datacenters')
          .reply(200, "", { 'x-api-version': '6.5.0' });
      } else if(provider === 'rackspace') {
        nock('https://' + client.serversUrl)
          .get('/')
          .reply(200,
             "{\"versions\":[{\"id\":\"v1.0\",\"status\":\"BETA\"}]}", {});
      }
    }
    vows
      .describe('pkgcloud/common/compute/flavor [' + provider + ']')
      .addBatch(batchOne(clients[provider], provider, nock))
       ["export"](module);
  });