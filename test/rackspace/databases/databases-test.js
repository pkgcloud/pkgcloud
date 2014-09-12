/*
 * databases-test.js: Tests for Rackspace Cloud Database instances
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var should = require('should'),
    hock = require('hock'),
    http = require('http'),
    async = require('async'),
    helpers = require('../../helpers'),
    mock = !!process.env.MOCK;

describe('pkgcloud/rackspace/databases/databases', function() {

  var client, testContext = {}, hockInstance, authHockInstance, server, authServer;

  describe('The pkgcloud Rackspace Database client', function() {

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

    it('the createDatabases() method should respond correctly', function(done) {
      if (mock) {
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

        hockInstance
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases',
          {
            databases: [
              { name: 'TestDatabase' }
            ]
          })
          .reply(202);
      }

      helpers.selectInstance(client, function (instance) {
        client.createDatabase({name: 'TestDatabase', instance: instance}, function(err, response) {
          should.not.exist(err);
          should.exist(response);
          response.statusCode.should.equal(202);
          authHockInstance && authHockInstance.done();
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    it('create another database for pagination test should respond correctly', function (done) {

      if (mock) {
        hockInstance
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases',
          {
            databases: [
              { name: 'TestDatabaseTwo' }
            ]
          })
          .reply(202);
      }

      helpers.selectInstance(client, function (instance) {
        client.createDatabase({name: 'TestDatabaseTwo', instance: instance}, function(err, response) {
          should.not.exist(err);
          should.exist(response);
          response.statusCode.should.equal(202);
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    it('the create() method should respond correctly', function (done) {

      if (mock) {
        hockInstance
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .post('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases',
          {
            databases: [
              { name: 'TestDatabaseThree' }
            ]
          })
          .reply(202);
      }

      helpers.selectInstance(client, function (instance) {
        client.create({name: 'TestDatabaseThree', instance: instance}, function (err, response) {
          should.not.exist(err);
          should.exist(response);
          response.statusCode.should.equal(202);
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    it('the createDatabase() method with no name should get an error for name', function(done) {
      client.createDatabase({}, function(err, response) {
        should.exist(err);
        should.not.exist(response);
        err.message.should.equal('options. Name is a required argument');
        done();
      });
    });

    it('the createDatabase() method with no instance should get an error for instance', function (done) {
      client.createDatabase({ name: 'NotCreated' }, function (err, response) {
        should.exist(err);
        should.not.exist(response);
        err.message.should.equal('options. Instance is a required argument');
        done();
      });
    });

    it('the getDatabases() method should return a list of databases', function (done) {

      if (mock) {
        hockInstance
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases')
          .reply(200, {databases: [{name: 'TestDatabase'}, {name: 'TestDatabaseTwo'}]});
      }

      helpers.selectInstance(client, function (instance) {
        client.getDatabases({ instance: instance }, function(err, list) {
          should.not.exist(err);
          should.exist(list);
          list.should.be.an.instanceOf(Array);
          list.should.have.length(2);
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    it('the getDatabases() method should return a list of databases with names', function (done) {

      if (mock) {
        hockInstance
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases')
          .reply(200, {databases: [
            {name: 'TestDatabase'},
            {name: 'TestDatabaseTwo'}
          ]});
      }

      helpers.selectInstance(client, function (instance) {
        client.getDatabases({ instance: instance }, function (err, list) {
          should.not.exist(err);
          should.exist(list);
          should.exist(list[0])
          list[0].name.should.equal('TestDatabase');
          list[0].name.should.be.a.String;
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    it('the getDatabases() method with limit should respond one element', function (done) {

      if (mock) {
        hockInstance
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases?limit=1')
          .reply(200, {databases: [
            {name: 'TestDatabase'}
          ]});
      }

      helpers.selectInstance(client, function (instance) {
        client.getDatabases({ instance: instance, limit: 1 }, function (err, instances) {
          should.not.exist(err);
          should.exist(instances);
          instances.should.be.an.instanceOf(Array);
          instances.should.have.length(1);
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    it('the getDatabases() method with limit should pass as third argument the offset mark', function (done) {

      if (mock) {
        hockInstance
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases?limit=1')
          .reply(200, helpers.loadFixture('rackspace/databasesLimit.json'));
      }

      helpers.selectInstance(client, function (instance) {
        client.getDatabases({ instance: instance, limit: 1 }, function (err, instances, offset) {
          should.not.exist(err);
          should.exist(instances);
          should.exist(offset);
          offset.should.equal('TestDatabase');
          testContext.marker = offset;
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    it('the getDatabases() method with offset should respond less quantity', function (done) {

      if (mock) {
        hockInstance
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases?marker=TestDatabase')
          .reply(200, { databases: [{ name: 'TestDatabaseTwo '}] });
      }

      helpers.selectInstance(client, function (instance) {
        client.getDatabases({ instance: instance, offset: testContext.marker },
          function(err, instances, offset) {
            should.not.exist(err);
            should.exist(instances);
            instances.should.have.length(1);
            should.not.exist(offset);
            hockInstance && hockInstance.done();
            done();
        });
      });
    });

    it('the getDatabases() method with limit and offset ' +
      'should respond just one result with no more next points', function (done) {

      if (mock) {
        hockInstance
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .get('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases?limit=1&marker=TestDatabase')
          .reply(200, { databases: [{ name: 'TestDatabaseTwo' }] });
      }

      helpers.selectInstance(client, function (instance) {
        client.getDatabases({ instance: instance, limit: 1, offset: testContext.marker },
          function (err, instances, offset) {
            should.not.exist(err);
            should.exist(instances);
            instances.should.be.an.Array;
            instances.should.have.length(1);
            should.not.exist(offset);
            hockInstance && hockInstance.done();
            done();
          });
      });
    });

    it('the destroyDatabase() method with first db should respond correctly', function (done) {

      if (mock) {
        hockInstance
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .delete('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases/TestDatabase')
          .reply(202);
      }

      helpers.selectInstance(client, function (instance) {
        client.destroyDatabase('TestDatabase', instance, function(err, response) {
          should.not.exist(err);
          should.exist(response);
          response.statusCode.should.equal(202);
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    it('the destroyDatabase() method with last db should respond correctly', function (done) {

      if (mock) {
        hockInstance
          .get('/v1.0/123456/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .delete('/v1.0/123456/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases/TestDatabaseTwo')
          .reply(202);
      }

      helpers.selectInstance(client, function (instance) {
        client.destroyDatabase('TestDatabaseTwo', instance, function (err, response) {
          should.not.exist(err);
          should.exist(response);
          response.statusCode.should.equal(202);
          hockInstance && hockInstance.done();
          done();
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
      ], done)
    });

  });
});

