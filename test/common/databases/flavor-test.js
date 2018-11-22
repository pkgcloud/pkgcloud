/*
* flavor-test.js: Test for pkgcloud Openstack Trove database flavors.
*
* (C) 2014 Hewlett-Packard Development Company, L.P.
*
*/

var should = require('should'),
    hock = require('hock'),
    http = require('http'),
    async = require('async'),
    helpers = require('../../helpers'),
    Flavor = require('../../../lib/pkgcloud/core/compute/flavor').Flavor,
    providers = require('../../configs/providers.json'),
    mock = !!process.env.MOCK;

// Declaring variables for helper functions defined later
var setupGetFlavorMock;
function setupGetFlavorsMock(hockInstance, provider ){
  if (provider === 'rackspace') {
    hockInstance
      .get('/v1.0/123456/flavors')
      .reply(200, helpers.loadFixture('rackspace/databaseFlavors.json'));
  }
  else if (provider === 'openstack') {
    hockInstance
      .get('/v1.0/72e90ecb69c44d0296072ea39e537041/flavors')
      .reply(200, helpers.loadFixture('openstack/databaseFlavors.json'));

  }
  else if (provider === 'hp') {
    hockInstance
      .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/flavors')
      .reply(200, helpers.loadFixture('hp/databaseFlavors.json'));
  }
}

providers.filter(function (provider) {
 return !!helpers.pkgcloud.providers[provider].database && provider !== 'azure';
}).forEach(function (provider) {
  describe('pkgcloud/rackspace/['+provider+']/flavors', function () {
    var testContext = {},
        client, authHockInstance, hockInstance, server, authServer;

    describe('The pkgcloud '+provider+' Database client', function () {

      before(function (done) {
        client = helpers.createClient(provider, 'database');

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
            helpers.setupAuthenticationMock(authHockInstance, provider);
          }

          setupGetFlavorsMock(hockInstance, provider);
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
          setupGetFlavorMock(hockInstance, provider);
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
        ], done);
      });
    });
  });
});


setupGetFlavorMock = function (hockInstance, provider) {
  if (provider === 'rackspace') {
    hockInstance
      .get('/v1.0/123456/flavors/3')
      .reply(200, helpers.loadFixture('rackspace/databaseFlavor3.json'));
  }
  else if (provider === 'openstack') {
    hockInstance
      .get('/v1.0/72e90ecb69c44d0296072ea39e537041/flavors/3')
      .reply(200, helpers.loadFixture('openstack/databaseFlavor3.json'));
  }
  else if (provider === 'hp') {
    hockInstance
      .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/flavors/3')
      .reply(200, helpers.loadFixture('hp/databaseFlavor3.json'));
  }
};
