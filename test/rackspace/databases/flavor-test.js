/*
* flavor-test.js: Test for pkgcloud Rackspace database flavor requests
*
* (C) 2010 Nodejitsu Inc.
*
*/

var should = require('should'),
    hock = require('hock'),
    async = require('async'),
    helpers = require('../../helpers'),
    Flavor = require('../../../lib/pkgcloud/core/compute/flavor').Flavor,
    mock = !!process.env.NOCK;

describe('pkgcloud/rackspace/databases/errors', function () {
  var testContext = {},
      client, authServer, server;

  describe('The pkgcloud Rackspace Database client', function () {

    before(function (done) {
      client = helpers.createClient('rackspace', 'database');

      if (!mock) {
        return done();
      }

      async.parallel([
        function (next) {
          hock.createHock(12346, function (err, hockClient) {
            should.not.exist(err);
            should.exist(hockClient);

            authServer = hockClient;
            next();
          });
        },
        function (next) {
          hock.createHock(12345, function (err, hockClient) {
            should.not.exist(err);
            should.exist(hockClient);

            server = hockClient;
            next();
          });
        }
      ], done);
    });

    function getFlavors(auth, callback) {
      if (mock) {
        var credentials = {
          username: client.config.username,
          key: client.config.apiKey
        };

        if (auth) {
          authServer
            .post('/v1.1/auth', { credentials: credentials })
            .reply(200, helpers.loadFixture('rackspace/token.json'));
        }

        server
          .get('/v1.0/537645/flavors')
          .reply(200, helpers.loadFixture('rackspace/databaseFlavors.json'))
      }

      client.getFlavors(callback);
    }

    it('the getFlavors() method should return the list of flavors', function(done) {
      getFlavors(true, function (err, flavors) {
        should.not.exist(err);
        should.exist(flavors);
        flavors.should.be.instanceOf(Array);
        flavors.forEach(function (flavor) {
          flavor.should.be.instanceOf(Flavor);
        });

        server && server.done();
        authServer && authServer.done();
        testContext.flavors = flavors;
        done();
      });
    });

    it('the getFlavors() method should return the list of flavor with rackspace specific information', function (done) {
      getFlavors(false, function (err, flavors) {
        should.not.exist(err);
        should.exist(flavors);
        flavors.should.be.instanceOf(Array);
        flavors.forEach(function (flavor) {
          flavor.ram.should.be.a('number');
          flavor.href.should.be.a('string');
        });
        server && server.done();
        done();
      });
    });

    it('the getFlavor() method should return a valid flavor', function(done) {
      if (mock) {
        server
          .get('/v1.0/537645/flavors/3')
          .reply(200, helpers.loadFixture('rackspace/databaseFlavor3.json'));
      }

      client.getFlavor(testContext.flavors[2].id, function(err, flavor) {
        should.not.exist(err);
        should.exist(flavor);
        flavor.should.be.instanceOf(Flavor);
        flavor.id.should.equal(testContext.flavors[2].id);
        server && server.done();
        done();
      });
    });

    after(function (done) {
      if (!mock) {
        return done();
      }

      async.parallel([
        function (next) {
          authServer.close(next);
        },
        function (next) {
          server.close(next);
        }
      ], done)
    });
  });
});

