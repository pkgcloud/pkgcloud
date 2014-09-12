/*
* flavor-test.js: Test for pkgcloud Rackspace database flavor requests
*
* (C) 2010 Nodejitsu Inc.
*
*/

var should = require('should'),
    hock = require('hock'),
    http = require('http'),
    async = require('async'),
    helpers = require('../../helpers'),
    Flavor = require('../../../lib/pkgcloud/core/compute/flavor').Flavor,
    mock = !!process.env.MOCK;

describe('pkgcloud/rackspace/databases/flavors', function () {
  var testContext = {},
      client, authHockInstance, hockInstance, server, authServer;

  describe('The pkgcloud Rackspace Database client', function () {

    before(function (done) {
      client = helpers.createClient('rackspace', 'database');

      if (!mock) {
        return done();
      }

      hockInstance = hock.createHock({ throwOnUnmatched: false });
      authHockInstance = hock.createHock();

      server = http.createServer(hockInstance.handler);
      authServer = http.createServer(authHockInstance.handler);

      async.parallel([
        function (next) {
          server.listen(12345, next);
        },
        function (next) {
          authServer.listen(12346, next);
        }
      ], done);
    });

    function getFlavors(auth, callback) {
      if (mock) {
        if (auth) {
          authHockInstance
            .post('/v2.0/tokens', {
              auth: {
                'RAX-KSKEY:apiKeyCredentials': {
                  username: 'MOCK-USERNAME',
                  apiKey: 'MOCK-API-KEY'
                }
              }
            })
            .reply(200, helpers.getRackspaceAuthResponse());
        }

        hockInstance
          .get('/v1.0/123456/flavors')
          .reply(200, helpers.loadFixture('rackspace/databaseFlavors.json'))
      }

      client.getFlavors(callback);
    }

    it('the getFlavors() method should return the list of flavors', function(done) {
      getFlavors(true, function (err, flavors) {
        should.not.exist(err);
        should.exist(flavors);
        flavors.should.be.an.Array;
        flavors.forEach(function (flavor) {
          flavor.should.be.instanceOf(Flavor);
        });

        hockInstance && hockInstance.done();
        authHockInstance && authHockInstance.done();
        testContext.flavors = flavors;
        done();
      });
    });

    it('the getFlavors() method should return the list of flavor with rackspace specific information', function (done) {
      getFlavors(false, function (err, flavors) {
        should.not.exist(err);
        should.exist(flavors);
        flavors.should.be.an.Array;
        flavors.forEach(function (flavor) {
          flavor.ram.should.be.a.Number;
          flavor.href.should.be.a.String;
        });
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the getFlavor() method should return a valid flavor', function(done) {
      if (mock) {
        hockInstance
          .get('/v1.0/123456/flavors/3')
          .reply(200, helpers.loadFixture('rackspace/databaseFlavor3.json'));
      }

      client.getFlavor(testContext.flavors[2].id, function(err, flavor) {
        should.not.exist(err);
        should.exist(flavor);
        flavor.should.be.instanceOf(Flavor);
        flavor.id.should.equal(testContext.flavors[2].id);
        hockInstance && hockInstance.done();
        done();
      });
    });

    after(function (done) {
      if (!mock) {
        return done();
      }

      async.parallel([
        function (next) {
          server.close(next);
        },
        function (next) {
          authServer.close(next);
        }
      ], done)
    });
  });
});

