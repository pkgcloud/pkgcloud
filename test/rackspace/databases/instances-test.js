/*
* instances-test.js: Tests for Rackspace Cloud Database instances
*
* (C) 2010 Nodejitsu Inc.
* MIT LICENSE
*
*/

var should = require('should'),
    hock = require('hock'),
    async = require('async'),
    helpers = require('../../helpers'),
    Flavor = require('../../../lib/pkgcloud/core/compute/flavor').Flavor,
    Instance = require('../../../lib/pkgcloud/rackspace/database/instance').Instance,
    mock = !!process.env.MOCK;

describe('pkgcloud/rackspace/databases/instances', function () {
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

    describe('the create() method', function() {

      var err, instance;

      before(function(done) {
        
        if (mock) {
          authServer
            .post('/v2.0/tokens', {
              auth: {
                'RAX-KSKEY:apiKeyCredentials': {
                  username: 'MOCK-USERNAME',
                  apiKey: 'MOCK-API-KEY'
                }
              }
            })
            .replyWithFile(200, __dirname + '/../../fixtures/rackspace/auth.json');

          server
            .get('/v1.0/123456/flavors/1')
            .reply(200, helpers.loadFixture('rackspace/databaseFlavor1.json'))

            .post('/v1.0/123456/instances', {
              instance: {
                name: 'test-instance',
                flavorRef: 'https://ord.databases.api.rackspacecloud.com/v1.0/123456/flavors/1',
                databases: [],
                volume: {
                  size:1
                }
              }
            })
            .reply(200, helpers.loadFixture('rackspace/createdDatabaseInstance.json'));
          
        }
        client.getFlavor(1, function (err, flavor) {
          should.not.exist(err);
          should.exist(flavor);
          flavor.should.be.instanceOf(Flavor);

          client.createInstance({
            name: 'test-instance',
            flavor: flavor
          }, function(e, i) {
            err = e;
            instance = i;
            authServer && authServer.done();
            server && server.done();
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

        var err, instances, offset

        before(function(done) {

          if (mock) {
            server
              .get('/v1.0/123456/instances')
              .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          }

          client.getInstances(function(e, i, o) {
            err = e;
            instances = i;
            offset = o;
            server && server.done();
            done();
          });
        });

        it('should return the list of instances', function () {
          should.not.exist(err);
          should.exist(instances);
          instances.should.be.instanceOf(Array);
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
            instance.links.should.be.instanceOf(Array);
            instance.flavor.should.be.a('object');
            instance.volume.should.be.a('object');
            instance.volume.size.should.be.a('number');
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
        var err, instances, offset

        before(function (done) {

          if (mock) {
            server
              .get('/v1.0/123456/instances?limit=2')
              .reply(200, helpers.loadFixture('rackspace/databaseInstancesLimit2.json'))
          }

          client.getInstances({ limit: 2 }, function (e, i, o) {
            err = e;
            instances = i;
            offset = o;
            server && server.done();
            done();
          });
        });

        it('should respond at least 2 elements', function() {
          should.not.exist(err);
          should.exist(instances);
          instances.should.be.instanceOf(Array);
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
          server
            .get('/v1.0/123456/instances')
            .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
            .delete('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f')
            .reply(202)
        }

        helpers.selectInstance(client, function (instance) {
          testContext.Instance = instance;
          client.destroyInstance(testContext.Instance, function(err, result) {
            should.not.exist(err);
            should.exist(result);
            result.statusCode.should.equal(202);
            server && server.done();
            done();
          });
        });
      });
    });

    describe('the getInstance() method', function () {
      it('should response with details', function (done) {

        if (mock) {
          server
            .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f')
            .reply(200, helpers.loadFixture('rackspace/databaseInstance.json'))
        }

        client.getInstance(testContext.Instance.id, function (err, instance) {
          should.not.exist(err);
          should.exist(instance);
          instance.should.be.instanceOf(Instance);
          instance.id.should.equal(testContext.Instance.id);
          server && server.done();
          done();
        });
      });
    });

    describe('the getInstances() method', function () {
      it('with offset should respond less quantity', function (done) {

        if (mock) {
          server
            .get('/v1.0/123456/instances?marker=55041e91-98ab-4cd5-8148-f3b3978b3262')
            .reply(200, helpers.loadFixture('rackspace/databaseInstanceOffset.json'))
        }

        client.getInstances({ offset: testContext.marker }, function (err, instances, offset) {
          should.not.exist(err);
          should.exist(instances);
          instances.should.be.instanceOf(Array);
          should.ok(instances.length >= 2
            && instances.length < testContext.instancesQuantity);
          server && server.done();
          done();
        });

      });

      it('with limit and offset should respond just one result with more next points', function (done) {

        if (mock) {
          server
            .get('/v1.0/123456/instances?limit=1&marker=55041e91-98ab-4cd5-8148-f3b3978b3262')
            .reply(200, helpers.loadFixture('rackspace/databaseInstanceLimitOffset.json'))
        }

        client.getInstances({limit: 1, offset: testContext.marker }, function (err, instances, offset) {
          should.not.exist(err);
          should.exist(instances);
          instances.should.be.instanceOf(Array);
          should.exist(offset);
          instances.should.have.length(1);
          server && server.done();
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
          server
            .get('/v1.0/123456/instances')
            .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
        }

        helpers.selectInstance(client, function (instance) {
          client.setFlavor(instance, function (err) {
            should.exist(err);
            server && server.done();
            done();
          });
        });
      });

      it('without instance parameter should get errors', function (done) {

        if (mock) {
          server
            .get('/v1.0/123456/flavors/2')
            .reply(200, helpers.loadFixture('rackspace/databaseFlavor2.json'))
        }

        client.getFlavor(2, function (err, flavor) {
          should.not.exist(err);
          should.exist(flavor);

          client.setFlavor(flavor, function(err) {
            should.exist(err);
            server && server.done();
            done();
          });
        });
      });

      it('with correct inputs should respond correctly', function (done) {

        if (mock) {
          server
            .get('/v1.0/123456/instances')
            .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
            .get('/v1.0/123456/flavors/2')
            .reply(200, helpers.loadFixture('rackspace/databaseFlavor2.json'))
            .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/action', {
              resize: {
                flavorRef: 'https://ord.databases.api.rackspacecloud.com/v1.0/123456/flavors/2'
              }
            })
            .reply(202)
        }

        helpers.selectInstance(client, function (instance) {
          var newFlavor = (Number(instance.flavor.id) === 4) ? 1 : Number(instance.flavor.id) + 1;
          client.getFlavor(newFlavor, function (err, flavor) {
            should.not.exist(err);
            should.exist(flavor);
            client.setFlavor(instance, flavor, function (err) {
              should.not.exist(err);
              server && server.done();
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
          server
            .get('/v1.0/123456/instances')
            .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
        }

        helpers.selectInstance(client, function (instance) {
          client.setVolumeSize(instance, function (err) {
            should.exist(err);
            server && server.done();
            done();
          });
        });
      });

      it('without invalid size parameter should get errors', function (done) {

        if (mock) {
          server
            .get('/v1.0/123456/instances')
            .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
        }

        helpers.selectInstance(client, function (instance) {
          client.setVolumeSize(instance, 12, function (err) {
            should.exist(err);
            server && server.done();
            done();
          });
        });
      });

      it('with correct inputs should respond correctly', function (done) {

        if (mock) {
          server
            .get('/v1.0/123456/instances')
            .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
            .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/action', {
              resize: {
                volume :{
                  size :2
                }
              }
            })
            .reply(202)
        }

        helpers.selectInstance(client, function (instance) {
          var newSize = (Number(instance.volume.size) === 8) ? 1 : Number(instance.volume.size) + 1;

          client.setVolumeSize(instance, newSize, function (err) {
            should.not.exist(err);
            server && server.done();
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
        })
      });

      it('without flavor should respond with errors', function (done) {
        client.createInstance({ name: 'test-without-flavor' }, function (err) {
          should.exist(err);
          done();
        })
      });

      it('with invalid size should respond with errors', function (done) {
        if (mock) {
          server
            .get('/v1.0/123456/flavors/1')
            .reply(200, helpers.loadFixture('rackspace/databaseFlavor1.json'))
        }

        client.getFlavor(1, function (err, flavor) {
          client.createInstance({
            name: 'test-instance',
            flavor: flavor,
            size: '1'
          }, function(err) {
            should.exist(err);
            server && server.done();
            done();
          });
        });
      });
    });

    describe('the restartInstance() method', function () {
      it('with no instance should return error', function (done) {
        client.restartInstance(function (err) {
          should.exist(err);
          done();
        })
      });

      it('with valid instance should restart', function (done) {
        if (mock) {
          server
            .get('/v1.0/123456/instances')
            .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
            .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/action', { restart :{}})
            .reply(202)
        }

        helpers.selectInstance(client, function (instance) {
          client.restartInstance(instance, function (err) {
            should.not.exist(err);
            server && server.done();
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
          authServer.close(next);
        },
        function (next) {
          server.close(next);
        }
      ], done)
    });
  });
});

function assertLinks(links) {
  links.should.be.instanceOf(Array);
  links.forEach(function (link) {
    should.exist(link.href);
    should.exist(link.rel);
  });
}

