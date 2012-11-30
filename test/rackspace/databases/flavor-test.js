/*
 * flavor-test.js: Test for pkgcloud Rackspace database flavor requests
 * 
 * (C) 2010 Nodejitsu Inc.
 * 
 */

var vows = require('vows'),
    assert = require('../../helpers/assert'),
    nock = require('nock')
    helpers = require('../../helpers');

var testContext = {},
    client = helpers.createClient('rackspace', 'database');

if (process.env.NOCK) {
  var credentials = {
     username: client.config.username,
     key: client.config.apiKey
  };

  nock('https://' + client.authUrl)
    .post('/v1.1/auth', { "credentials": credentials })
      .reply(200, helpers.loadFixture('rackspace/token.json'));

  nock('https://ord.databases.api.rackspacecloud.com')
    .get('/v1.0/537645/flavors')
      .reply(200, helpers.loadFixture('rackspace/databaseFlavors.json'))

    .get('/v1.0/537645/flavors/3')
      .reply(200, helpers.loadFixture('rackspace/databaseFlavor3.json'));
}

vows.describe('pkgcloud/rackspace/database/flavors').addBatch({
  "The pkgcloud Rackspace database client": {
    "the getFlavors() method": {
      topic: function () {
        client.getFlavors(this.callback);
      },
      "should return the list of flavors": function (err, flavors) {
        testContext.flavors = flavors;
        assert.isNull(err);
        assert.isArray(flavors);
        flavors.forEach(function (flavor) {
          assert.assertFlavor(flavor);
        });
      },
      "should return the list of flavor with rackspace specific information": function (err, flavors) {
        assert.isNull(err);
        flavors.forEach(function (flavor) {
          assert.isNumber(flavor.ram);
          assert.isString(flavor.href);
        });
      }
    }
  }
}).addBatch({
  "The pkgcloud Rackspace database client": {
    "the getFlavor() method": {
      topic: function () {
        client.getFlavor(testContext.flavors[2].id, this.callback);
      },
      "should return a valid flavor": function (err, flavor) {
        assert.isNull(err);
        assert.assertFlavor(flavor);
      }
    }
  }
}).export(module);
