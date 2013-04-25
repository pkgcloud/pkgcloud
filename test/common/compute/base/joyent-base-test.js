/*
 * joyent-base-test.js: Test that should be common to all providers.
 *
 * (C) 2013 Nodejitsu Inc.
 *
 */

var fs = require('fs'),
  path = require('path'),
  should = require('should'),
  utile = require('utile'),
  helpers = require('../../../helpers'),
  nock = require('nock'),
  async = require('async'),
  _ = require('underscore'),
  providers = require('../../../configs/providers.json'),
  versions = require('../../../fixtures/versions.json'),
  Flavor = require('../../../../lib/pkgcloud/core/compute/flavor').Flavor,
  Image = require('../../../../lib/pkgcloud/core/compute/image').Image,
  Server = require('../../../../lib/pkgcloud/core/compute/server').Server,
  baseTests = require('../base-definitions'),
  mock = !!process.env.NOCK;

var provider = 'joyent';

if (_.indexOf(providers, provider) === -1) {
  console.log('Provider ' + provider + ' is disabled, skipping');
  return;
}

describe('pkgcloud/common/compute/base [' + provider + ']', function () {

  var testContext = {},
    client = helpers.createClient(provider, 'compute');

  it(baseTests.getVersion.description, baseTests.getVersion.test(provider, client, testContext));
  it(baseTests.getFlavors.description, baseTests.getFlavors.test(provider, client, testContext));
  it(baseTests.getImages.description, baseTests.getImages.test(provider, client, testContext));
  it(baseTests.createServer.description, baseTests.createServer.test(provider, client, testContext));
  it(baseTests.destroyServer.description, baseTests.destroyServer.test(provider, client, testContext));

});