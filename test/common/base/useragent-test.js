/*
 * useragent-test.js: Tests for pkgcloud base client useragent
 *
 * (C) 2015 Ken Perkins, Rackspace Inc.
 *
 */

var pkgcloud = require('../../../lib/pkgcloud'),
  Client = new require('../../../lib/pkgcloud/core/base/client').Client;

require('should');

describe('pkgcloud/core/base/client/useragent', function () {
  describe('getUserAgent tests', function () {
    it('should return the default useragent', function () {
      var cli = new Client();

      cli.getUserAgent().should.equal('nodejs-pkgcloud/' + pkgcloud.version);
    });
  });

  describe('setCustomUserAgent tests', function () {
    it('should allow prefixing a custom useragent', function () {
      var cli = new Client();

      cli.setCustomUserAgent('my-app/1.2.3');
      cli.getUserAgent().should.equal('my-app/1.2.3 nodejs-pkgcloud/' + pkgcloud.version);
    });
  });
});
