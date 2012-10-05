/*
 * authentication-test.js: Tests for pkgcloud Rackspace storage authentication
 *
 * (C) 2010 Nodejitsu Inc.
 *
 */

var vows = require('vows'),
    macros = require('../macros'),
    helpers = require('../../helpers');

var testData = {},
    client = helpers.createClient('rackspace', 'storage');

if (process.env.NOCK) {
  return;
}

vows.describe('pkgcloud/rackspace/storage/authentication').addBatch({
  "The pkgcloud Rackspace storage client": {
    "should have core methods defined": macros.shouldHaveCreds(client),
    "the auth() method": {
      "with a valid username and api key": macros.shouldAuthenticate(client),
      "with an invalid username and api key": macros.shouldNotAuthenticate('storage')
    }
  }
}).export(module);
