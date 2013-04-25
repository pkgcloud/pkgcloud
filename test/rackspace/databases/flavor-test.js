/*
* flavor-test.js: Test for pkgcloud Rackspace database flavor requests
*
* (C) 2010 Nodejitsu Inc.
*
*/

var should = require('should'),
    nock = require('nock'),
    helpers = require('../../helpers'),
    Flavor = require('../../../lib/pkgcloud/core/compute/flavor').Flavor,
    mock = !!process.env.NOCK;

describe('pkgcloud/rackspace/databases/errors', function () {
  var testContext = {},
      client = helpers.createClient('rackspace', 'database'), n;

  describe('The pkgcloud Rackspace Database client', function () {

    var a;

    function getFlavors(auth, callback) {
      if (mock) {
        var credentials = {
          username: client.config.username,
          key: client.config.apiKey
        };

        if (auth) {
          a = nock('https://' + client.authUrl)
            .post('/v1.1/auth', { credentials: credentials })
            .reply(200, helpers.loadFixture('rackspace/token.json'));
        }

        n = nock('https://ord.databases.api.rackspacecloud.com')
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

        a.done();
        n.done();
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
        n.done();
        done();
      });
    });

    it('the getFlavor() method should return a valid flavor', function(done) {
      if (mock) {
        n = nock('https://ord.databases.api.rackspacecloud.com')
          .get('/v1.0/537645/flavors/3')
          .reply(200, helpers.loadFixture('rackspace/databaseFlavor3.json'));
      }

      client.getFlavor(testContext.flavors[2].id, function(err, flavor) {
        should.not.exist(err);
        should.exist(flavor);
        flavor.should.be.instanceOf(Flavor);
        flavor.id.should.equal(testContext.flavors[2].id);
        n.done();
        done();
      });
    });
  });
});

