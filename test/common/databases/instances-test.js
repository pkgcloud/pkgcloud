/*
* instances-test.js: Tests for Openstack Trove instances
*
* (C) 2014 Hewlett-Packard Development Company, L.P.
*
*/

var should = require('should'),
    hock = require('hock'),
    http = require('http'),
    async = require('async'),
    helpers = require('../../helpers'),
    providers = require('../../configs/providers.json'),
    Flavor = require('../../../lib/pkgcloud/core/compute/flavor').Flavor,
    Instance = require('../../../lib/pkgcloud/openstack/database/instance').Instance,
    mock = !!process.env.MOCK;

// Declaring variables for helper functions defined later
var assertLinks, setupCreateInstanceMock, setupGetInstancesMock,
    setupGetDatabaseInstancesWithLimitMock, setupDestroyInstanceMock,
    setGetInstanceMock, setGetFlavorsMock, setupSetFlavorMock, setupResizeMock,
    setupGetOneFlavorMock, setupRestartInstanceMock, setupEnableRootMock;

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].database && provider !== 'azure';
}).forEach(function (provider) {
  describe('pkgcloud/['+provider+']/databases/instances', function () {
    var testContext = {},
        client, authHockInstance, hockInstance, authServer, server;

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

      describe('the create() method', function() {

        var err, instance;

        before(function(done) {
          helpers.setupAuthenticationMock(authHockInstance, provider);
          setupCreateInstanceMock(hockInstance, provider);

          client.getFlavor(1, function (err, flavor) {
            should.not.exist(err);
            should.exist(flavor);
            flavor.should.be.instanceOf(Flavor);

            client.createInstance({
              name: 'test-instance',
              flavor: flavor,
              databases: ['db1']
            }, function(e, i) {
              err = e;
              instance = i;
              authHockInstance && authHockInstance.done();
              hockInstance && hockInstance.done();
              done();
            });
          });
        });

        it('should return a valid instance', function() {
          should.not.exist(err);
          should.exist(instance);
          instance.should.be.instanceOf(Instance);
        });

        it('should return the same name and flavor used', function() {
          should.not.exist(err);
          should.exist(instance);
          instance.name.should.equal('test-instance');
          should.equal(1, instance.flavor.id);
        });
      });

      describe('the getInstances() method', function() {
        describe('without options', function() {

          var err, instances, offset;

          before(function(done) {

            if (mock) {
              setupGetInstancesMock(hockInstance, provider);
            }

            client.getInstances(function(e, i, o) {
              err = e;
              instances = i;
              offset = o;
              hockInstance && hockInstance.done();
              done();
            });
          });

          it('should return the list of instances', function () {
            should.not.exist(err);
            should.exist(instances);
            instances.should.be.an.Array;
            instances.length.should.be.above(0);

            testContext.instancesQuantity = instances.length;
          });

          it('should valid instance each item in the list', function () {
            instances.forEach(function (instance) {
              instance.should.be.instanceOf(Instance);
            });
          });

          it('should response with extra info', function () {

            instances.forEach(function (instance) {
              should.exist(instance.id);
              instance.links.should.be.an.Array;
              instance.flavor.should.be.a.Object;
              instance.volume.should.be.a.Object;
              instance.volume.size.should.be.a.Number;
            });
          });

          it('should have correct flavor', function () {
            instances.forEach(function (instance) {
              should.exist(instance.flavor.id);
              assertLinks(instance.flavor.links);
            });
          });

          it('should have correct links', function () {
            instances.forEach(function (instance) {
              assertLinks(instance.links);
            });
          });

          it('should have a null offset', function () {
            should.not.exist(offset);
          });
        });

        describe('with limit', function () {

          var err, instances, offset;

          before(function (done) {

            if (mock) {
              setupGetDatabaseInstancesWithLimitMock(hockInstance, provider);
            }

            client.getInstances({ limit: 2 }, function (e, i, o) {
              err = e;
              instances = i;
              offset = o;
              hockInstance && hockInstance.done();
              done();
            });
          });

          it('should respond at least 2 elements', function() {
            should.not.exist(err);
            should.exist(instances);
            instances.should.be.an.Array;
            instances.should.have.length(2);
          });

          it('should pass as third argument the offset mark', function() {
            should.exist(offset);
            testContext.marker = offset;
          });
        });
      });

      describe('the destroyInstance() method', function() {
        it('should respond correctly', function(done) {

          if (mock) {
            setupDestroyInstanceMock(hockInstance, provider);
          }

          helpers.selectInstance(client, function (instance) {
            testContext.Instance = instance;
            client.destroyInstance(testContext.Instance, function(err, result) {
              should.not.exist(err);
              should.exist(result);
              result.statusCode.should.equal(202);
              hockInstance && hockInstance.done();
              done();
            });
          });
        });
      });

      describe('the getInstance() method', function () {
        it('should response with details', function (done) {

          if (mock) {
            setGetInstanceMock(hockInstance, provider);
          }

          client.getInstance(testContext.Instance.id, function (err, instance) {
            should.not.exist(err);
            should.exist(instance);
            instance.should.be.instanceOf(Instance);
            instance.id.should.equal(testContext.Instance.id);
            hockInstance && hockInstance.done();
            done();
          });
        });
      });

      describe('the getInstances() method', function () {
        it('with offset should respond less quantity', function (done) {
          if(provider !== 'rackspace') {
            return done();
          }

          if (mock) {
            hockInstance
              .get('/v1.0/123456/instances?marker=55041e91-98ab-4cd5-8148-f3b3978b3262')
              .reply(200, helpers.loadFixture('rackspace/databaseInstanceOffset.json'));
          }

          client.getInstances({ offset: testContext.marker }, function (err, instances, offset) {
            should.not.exist(err);
            should.exist(instances);
            should.not.exist(offset);
            instances.should.be.an.Array;
            should.ok(instances.length >= 2
              && instances.length < testContext.instancesQuantity);
            hockInstance && hockInstance.done();
            done();
          });

        });

        it('with limit and offset should respond just one result with more next points', function (done) {
          if(provider !== 'rackspace') {
            return done();
          }

          if (mock) {
            hockInstance
              .get('/v1.0/123456/instances?limit=1&marker=55041e91-98ab-4cd5-8148-f3b3978b3262')
              .reply(200, helpers.loadFixture('rackspace/databaseInstanceLimitOffset.json'));
          }

          client.getInstances({limit: 1, offset: testContext.marker }, function (err, instances, offset) {
            should.not.exist(err);
            should.exist(instances);
            instances.should.be.an.Array;
            should.exist(offset);
            instances.should.have.length(1);
            hockInstance && hockInstance.done();
            done();
          });
        });
      });

      describe('the setFlavor() method', function () {
        it('without instance and flavor parameters should get errors', function (done) {
          client.setFlavor(function (err) {
            should.exist(err);
            done();
          });
        });

        it('without flavor parameter should get errors', function (done) {

          if (mock) {
            setupGetInstancesMock(hockInstance, provider);
          }

          helpers.selectInstance(client, function (instance) {
            client.setFlavor(instance, function (err) {
              should.exist(err);
              hockInstance && hockInstance.done();
              done();
            });
          });
        });

        it('without instance parameter should get errors', function (done) {

          if (mock) {
            setGetFlavorsMock(hockInstance, provider);
          }

          client.getFlavor(2, function (err, flavor) {
            should.not.exist(err);
            should.exist(flavor);

            client.setFlavor(flavor, function(err) {
              should.exist(err);
              hockInstance && hockInstance.done();
              done();
            });
          });
        });

        it('with correct inputs should respond correctly', function (done) {

          if (mock) {
            setupSetFlavorMock(hockInstance, provider);
          }

          helpers.selectInstance(client, function (instance) {
            var newFlavor = (Number(instance.flavor.id) === 4) ? 1 : Number(instance.flavor.id) + 1;
            client.getFlavor(newFlavor, function (err, flavor) {
              should.not.exist(err);
              should.exist(flavor);
              client.setFlavor(instance, flavor, function (err) {
                should.not.exist(err);
                hockInstance && hockInstance.done();
                done();
              });
            });
          });
        });
      });

      describe('the setVolumeSize() method', function() {
        it('without instance and size parameters should get errors', function(done) {
          client.setVolumeSize(function(err) {
            should.exist(err);
            done();
          });
        });

        it('without size parameter should get errors', function (done) {

          if (mock) {
            setupGetInstancesMock(hockInstance, provider);
          }

          helpers.selectInstance(client, function (instance) {
            client.setVolumeSize(instance, function (err) {
              should.exist(err);
              hockInstance && hockInstance.done();
              done();
            });
          });
        });

        it('without invalid size parameter should get errors', function (done) {

          if (mock) {
                setupGetInstancesMock(hockInstance, provider);
          }

          helpers.selectInstance(client, function (instance) {
            client.setVolumeSize(instance, 12, function (err) {
              should.exist(err);
              hockInstance && hockInstance.done();
              done();
            });
          });
        });

        it('with correct inputs should respond correctly', function (done) {

          if (mock) {
            setupResizeMock (hockInstance, provider);
          }

          helpers.selectInstance(client, function (instance) {
            var newSize = (Number(instance.volume.size) === 8) ? 1 : Number(instance.volume.size) + 1;

            client.setVolumeSize(instance, newSize, function (err) {
              should.not.exist(err);
              hockInstance && hockInstance.done();
              done();
            });
          });
        });
      });

      describe('the create() method with errors', function () {
        it('should respond with errors', function (done) {
          client.createInstance(function(err) {
            should.exist(err);
            done();
          });
        });

        it('without flavor should respond with errors', function (done) {
          client.createInstance({ name: 'test-without-flavor' }, function (err) {
            should.exist(err);
            done();
          });
        });

        it('with invalid size should respond with errors', function (done) {
          if (mock) {
            setupGetOneFlavorMock(hockInstance, provider);
          }

          client.getFlavor(1, function (err, flavor) {
            client.createInstance({
              name: 'test-instance',
              flavor: flavor,
              size: '1'
            }, function(err) {
              should.exist(err);
              hockInstance && hockInstance.done();
              done();
            });
          });
        });
      });

      if (provider === 'rackspace' || provider === 'openstack') {
        describe('the enableRootUser() method', function() {
          it('with no instance should return error', function (done) {
            if (mock) {
              setupEnableRootMock(hockInstance, provider);
            }
            client.enableRootUser(testContext.Instance.id, function (err, body) {
              if (err) {
                return done(err);
              }

              should.exist(body);
              body.should.have.property('user');
              done();
            });
          });

          it('with valid instance should work', function (done) {
            client.listRootStatus(testContext.Instance.id, function (err, body) {
              if (err) {
                return done(err);
              }

              should.exist(body);
              body.should.have.property('rootEnabled');
              hockInstance && hockInstance.done();
              done();
            });
          });
        });
      }

      describe('the restartInstance() method', function () {
        it('with no instance should return error', function (done) {
          client.restartInstance(function (err) {
            should.exist(err);
            done();
          });
        });

        it('with valid instance should restart', function (done) {
          if (mock) {
            setupRestartInstanceMock (hockInstance, provider);
          }

          helpers.selectInstance(client, function (instance) {
            client.restartInstance(instance, function (err) {
              should.not.exist(err);
              hockInstance && hockInstance.done();
              done();
            });
          });
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

assertLinks = function (links) {
  links.should.be.an.Array;
  links.forEach(function (link) {
    should.exist(link.href);
    should.exist(link.rel);
  });
};

setupCreateInstanceMock = function (hockInstance,  provider) {
  if (provider === 'rackspace') {
    hockInstance
      .get('/v1.0/123456/flavors/1')
      .reply(200, helpers.loadFixture('rackspace/databaseFlavor1.json'))
      .post('/v1.0/123456/instances', {
        instance: {
          name: 'test-instance',
          flavorRef: 'https://ord.databases.api.rackspacecloud.com/v1.0/123456/flavors/1',
          databases: [{
            name: 'db1',
            character_set: 'utf8',
            collate: 'utf8_general_ci'
          }],
          volume: {
            size:1
          }
        }
      })
      .reply(200, helpers.loadFixture('rackspace/createdDatabaseInstance.json'));
  }
  else if (provider === 'openstack') {
      hockInstance
        .get('/v1.0/72e90ecb69c44d0296072ea39e537041/flavors/1')
        .reply(200, helpers.loadFixture('openstack/databaseFlavor1.json'))
        .post('/v1.0/72e90ecb69c44d0296072ea39e537041/instances', {
          instance: {
            name: 'test-instance',
            flavorRef: 'https://ord.databases.api.rackspacecloud.com/v1.0/123456/flavors/1',
            databases: [{
              name: 'db1',
              character_set: 'utf8',
              collate: 'utf8_general_ci'
            }],
            volume: {
              size:1
            }
          }
        })
        .reply(200, helpers.loadFixture('rackspace/createdDatabaseInstance.json'));
  }
  else if (provider === 'hp') {
      hockInstance
        .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/flavors/1')
        .reply(200, helpers.loadFixture('hp/databaseFlavor1.json'))
        .post('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances', {
          instance: {
            name: 'test-instance',
            flavorRef: 'https://ord.databases.api.rackspacecloud.com/v1.0/123456/flavors/1',
            databases: [{
              name: 'db1',
              character_set: 'utf8',
              collate: 'utf8_general_ci'
            }],
            volume: {
              size:1
            }
          }
        })
        .reply(200, helpers.loadFixture('rackspace/createdDatabaseInstance.json'));
  }
};

setupGetInstancesMock = function (hockInstance, provider) {
  if (provider === 'rackspace') {
    hockInstance
      .get('/v1.0/123456/instances')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'));
  }
  else if (provider === 'openstack') {
    hockInstance
      .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances')
      .reply(200, helpers.loadFixture('openstack/databaseInstances.json'));
  }
  else if (provider === 'hp') {
    hockInstance
      .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances')
      .reply(200, helpers.loadFixture('hp/databaseInstances.json'));
  }
};

setupGetDatabaseInstancesWithLimitMock = function (hockInstance, provider) {
  if (provider === 'rackspace') {
    hockInstance
      .get('/v1.0/123456/instances?limit=2')
      .reply(200, helpers.loadFixture('rackspace/databaseInstancesLimit2.json'));
  }
  else if (provider === 'openstack') {
    hockInstance
      .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances?limit=2')
      .reply(200, helpers.loadFixture('openstack/databaseInstancesLimit2.json'));
  }
  else if (provider === 'hp') {
    hockInstance
      .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances?limit=2')
      .reply(200, helpers.loadFixture('hp/databaseInstancesLimit2.json'));
  }
};

setupDestroyInstanceMock = function (hockInstance, provider) {
  if (provider === 'rackspace') {
    hockInstance
      .get('/v1.0/123456/instances')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
      .delete('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f')
      .reply(202);
  }
  else if (provider === 'openstack') {
    hockInstance
      .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances')
      .reply(200, helpers.loadFixture('openstack/databaseInstances.json'))
      .delete('/v1.0/72e90ecb69c44d0296072ea39e537041/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f')
      .reply(202);
  }
  else if (provider === 'hp') {
    hockInstance
      .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances')
      .reply(200, helpers.loadFixture('hp/databaseInstances.json'))
      .delete('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f')
      .reply(202);
  }
};

setGetInstanceMock = function (hockInstance, provider) {
  if (provider === 'rackspace') {
      hockInstance
        .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f')
        .reply(200, helpers.loadFixture('rackspace/databaseInstance.json'));
  }
  else if (provider === 'openstack') {
      hockInstance
           .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f')
           .reply(200, helpers.loadFixture('openstack/databaseInstance.json'));
  }
  else if (provider === 'hp') {
      hockInstance
           .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f')
           .reply(200, helpers.loadFixture('hp/databaseInstance.json'));
  }
};

setGetFlavorsMock = function (hockInstance, provider) {
  if (provider === 'rackspace') {
      hockInstance
        .get('/v1.0/123456/flavors/2')
        .reply(200, helpers.loadFixture('rackspace/databaseFlavor2.json'));
  }
  else if (provider === 'openstack') {
      hockInstance
           .get('/v1.0/72e90ecb69c44d0296072ea39e537041/flavors/2')
           .reply(200, helpers.loadFixture('openstack/databaseFlavor2.json'));
  }
  else if (provider === 'hp') {
        hockInstance
           .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/flavors/2')
           .reply(200, helpers.loadFixture('hp/databaseFlavor2.json'));
  }
};

setupSetFlavorMock = function (hockInstance, provider) {
  if (provider ==='rackspace') {
      hockInstance
        .get('/v1.0/123456/instances')
        .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
        .get('/v1.0/123456/flavors/2')
        .reply(200, helpers.loadFixture('rackspace/databaseFlavor2.json'))
        .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/action', {
          resize: {
            flavorRef: 'https://ord.databases.api.rackspacecloud.com/v1.0/123456/flavors/2'
          }
        })
        .reply(202);
  }
  else if (provider === 'openstack') {
      hockInstance
        .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances')
        .reply(200, helpers.loadFixture('openstack/databaseInstances.json'))
        .get('/v1.0/72e90ecb69c44d0296072ea39e537041/flavors/2')
        .reply(200, helpers.loadFixture('openstack/databaseFlavor2.json'))
        .post('/v1.0/72e90ecb69c44d0296072ea39e537041/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/action', {
          resize: {
            flavorRef: 'https://ord.databases.api.rackspacecloud.com/v1.0/123456/flavors/2'
          }
        })
        .reply(202);
  }
  else if (provider === 'hp') {
      hockInstance
        .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances')
        .reply(200, helpers.loadFixture('hp/databaseInstances.json'))
        .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/flavors/2')
        .reply(200, helpers.loadFixture('hp/databaseFlavor2.json'))
        .post('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/action', {
          resize: {
            flavorRef: 'https://ord.databases.api.rackspacecloud.com/v1.0/123456/flavors/2'
          }
        })
        .reply(202);
  }
};

setupResizeMock = function (hockInstance, provider) {
  if (provider === 'rackspace') {
    hockInstance
      .get('/v1.0/123456/instances')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
      .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/action', {
        resize: {
          volume :{
            size :2
          }
        }
      })
      .reply(202);
  }
  else if (provider === 'openstack') {
    hockInstance
      .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances')
      .reply(200, helpers.loadFixture('openstack/databaseInstances.json'))
      .post('/v1.0/72e90ecb69c44d0296072ea39e537041/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/action', {
        resize: {
          volume :{
            size :2
          }
        }
      })
      .reply(202);
  }
  else if (provider === 'hp') {
    hockInstance
      .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances')
      .reply(200, helpers.loadFixture('hp/databaseInstances.json'))
      .post('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/action', {
        resize: {
          volume :{
            size :2
          }
        }
      })
      .reply(202);
  }
};

setupGetOneFlavorMock = function (hockInstance, provider) {
  if (provider === 'rackspace') {
      hockInstance
        .get('/v1.0/123456/flavors/1')
        .reply(200, helpers.loadFixture('rackspace/databaseFlavor1.json'));
  }
  else if (provider === 'openstack') {
      hockInstance
        .get('/v1.0/72e90ecb69c44d0296072ea39e537041/flavors/1')
        .reply(200, helpers.loadFixture('openstack/databaseFlavor1.json'));
  }
  else if (provider === 'hp') {
      hockInstance
        .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/flavors/1')
        .reply(200, helpers.loadFixture('hp/databaseFlavor1.json'));
  }
};

setupRestartInstanceMock = function (hockInstance, provider) {
  if (provider === 'rackspace') {
    hockInstance
      .get('/v1.0/123456/instances')
      .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
      .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/action', { restart :{}})
      .reply(202);
  }
  else if (provider === 'openstack') {
    hockInstance
      .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances')
      .reply(200, helpers.loadFixture('openstack/databaseInstances.json'))
      .post('/v1.0/72e90ecb69c44d0296072ea39e537041/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/action', { restart :{}})
      .reply(202);
  }
  else if (provider === 'hp') {
    hockInstance
      .get('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances')
      .reply(200, helpers.loadFixture('hp/databaseInstances.json'))
      .post('/v1.0/5ACED3DC3AA740ABAA41711243CC6949/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/action', { restart :{}})
      .reply(202);
  }
};

setupEnableRootMock = function (hockInstance, provider) {
  if (provider === 'rackspace') {
    hockInstance
      .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/root')
      .reply(200, {
        user: {
          name: 'root',
          password: '12345'
        }
      })
      .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/root')
      .reply(200, {
        rootEnabled: true
      });
  } else if (provider === 'openstack') {
    hockInstance
      .post('/v1.0/72e90ecb69c44d0296072ea39e537041/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/root')
      .reply(200, {
        user: {
          name: 'root',
          password: '12345'
        }
      })
      .get('/v1.0/72e90ecb69c44d0296072ea39e537041/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/root')
      .reply(200, {
        rootEnabled: true
      });
  }
};
