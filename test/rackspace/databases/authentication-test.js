
/*
 * authentication-test.js: Tests for pkgcloud Rackspace compute authentication
 *
 * (C) 2010 Nodejitsu Inc.
 *
 */

var vows = require('vows'),
    assert = require('../../helpers/assert'),
    macros = require('../macros'),
    helpers = require('../../helpers');

var testData = {},
    client = helpers.createClient('rackspace', 'database');

vows.describe('pkgcloud/rackspace/database/authentication').addBatch({
  "The pkgcloud Rackspace database client": {
    "should have core methods defined": macros.shouldHaveCreds(client),
    "the getVersion() method": {
      topic: function () {
        console.log(client.getVersion);
        client.getVersion(this.callback);
      },
      "should return the proper version": function (versions) {
        assert.isArray(versions);
        assert.isFalse(versions.length == 0);
      }
    },
    "the auth() method": {
      "with a valid username and api key": macros.shouldAuthenticate(client),
      "with an invalid username and api key": macros.shouldNotAuthenticate('database')
    }
  }
}).export(module);
