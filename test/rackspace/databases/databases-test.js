/*
 * databases-test.js: Tests for Rackspace Cloud Database instances
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var vows = require('vows'),
    assert = require('../../helpers/assert'),
    nock = require('nock'),
    helpers = require('../../helpers'),
    mock = !!process.env.NOCK;

describe('pkgcloud/rackspace/databases/databases', function() {

  var client, testContext = {};

  before(function() {
    client = helpers.createClient('rackspace', 'database')
  });

  describe('The pkgcloud Rackspace Database client', function() {

    it('the createDatabases() method should respond correctly', function(done) {

      if (mock) {

        var credentials = {
          username: client.config.username,
          key: client.config.apiKey
        };

        nock('https://' + client.authUrl)
          .post('/v1.1/auth', { "credentials": credentials })
          .reply(200, helpers.loadFixture('rackspace/token.json'))

        nock('https://ord.databases.api.rackspacecloud.com')
          .get('/v1.0/537645/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .post('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases',
          {
            databases: [
              { name: 'TestDatabase' }
            ]
          })
          .reply(202);
      }

      helpers.selectInstance(client, function (instance) {
        client.createDatabase({name: 'TestDatabase', instance: instance}, function(err, response) {
          assert.isNull(err);
          assert.equal(response.statusCode, 202);
          done();
        });
      });
    });

    it('create another database for pagination test should respond correctly', function (done) {

      if (mock) {
        nock('https://ord.databases.api.rackspacecloud.com')
          .get('/v1.0/537645/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .post('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases',
          {
            databases: [
              { name: 'TestDatabaseTwo' }
            ]
          })
          .reply(202);
      }

      helpers.selectInstance(client, function (instance) {
        client.createDatabase({name: 'TestDatabaseTwo', instance: instance}, function(err, response) {
          assert.isNull(err);
          assert.equal(response.statusCode, 202);
          done();
        });
      });
    });

    it('the create() method should respond correctly', function (done) {

      if (mock) {
        nock('https://ord.databases.api.rackspacecloud.com')
          .get('/v1.0/537645/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .post('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases',
          {
            databases: [
              { name: 'TestDatabaseThree' }
            ]
          })
          .reply(202);
      }

      helpers.selectInstance(client, function (instance) {
        client.create({name: 'TestDatabaseThree', instance: instance}, function (err, response) {
          assert.isNull(err);
          assert.equal(response.statusCode, 202);
          done();
        });
      });
    });

    it('the createDatabase() method with no name should get an error for name', function(done) {
      client.createDatabase({}, function(err, response) {
        assert.isObject(err);
        assert.isString(err.message);
        assert.isUndefined(response);
        done();
      });
    });

    it('the createDatabase() method with no instance should get an error for instance', function (done) {
      client.createDatabase({ name: 'NotCreated' }, function (err, response) {
        assert.isObject(err);
        assert.isString(err.message);
        assert.isUndefined(response);
        done();
      });
    });

    it('the getDatabases() method should return a list of databases', function (done) {

      if (mock) {
        nock('https://ord.databases.api.rackspacecloud.com')
          .get('/v1.0/537645/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .get('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases')
          .reply(200, {databases: [{name: 'TestDatabase'}, {name: 'TestDatabaseTwo'}]});
      }

      helpers.selectInstance(client, function (instance) {
        client.getDatabases({ instance: instance }, function(err, list) {
          assert.isNull(err);
          assert.isArray(list);
          assert.ok(list.length > 0);
          done();
        });
      });
    });

    it('the getDatabases() method should return a list of databases with names', function (done) {

      if (mock) {
        nock('https://ord.databases.api.rackspacecloud.com')
          .get('/v1.0/537645/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .get('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases')
          .reply(200, {databases: [
            {name: 'TestDatabase'},
            {name: 'TestDatabaseTwo'}
          ]});
      }

      helpers.selectInstance(client, function (instance) {
        client.getDatabases({ instance: instance }, function (err, list) {
          assert.ok(list[0]);
          assert.ok(list[0].name);
          assert.isString(list[0].name);
          done();
        });
      });
    });

    it('the getDatabases() method with limit should respond one element', function (done) {

      if (mock) {
        nock('https://ord.databases.api.rackspacecloud.com')
          .get('/v1.0/537645/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .get('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases?limit=1')
          .reply(200, {databases: [
            {name: 'TestDatabase'}
          ]});
      }

      helpers.selectInstance(client, function (instance) {
        client.getDatabases({ instance: instance, limit: 1 }, function (err, instances) {
          assert.isNull(err);
          assert.isArray(instances);
          assert.equal(instances.length, 1);
          done();
        });
      });
    });

    it('the getDatabases() method with limit should pass as third argument the offset mark', function (done) {

      if (mock) {
        nock('https://ord.databases.api.rackspacecloud.com')
          .get('/v1.0/537645/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .get('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases?limit=1')
          .reply(200, helpers.loadFixture('rackspace/databasesLimit.json'));
      }

      helpers.selectInstance(client, function (instance) {
        client.getDatabases({ instance: instance, limit: 1 }, function (err, instances, offset) {
          assert.isNull(err);
          assert.isNotNull(offset);
          assert.ok(offset);
          testContext.marker = offset;
          done();
        });
      });
    });

    it('the getDatabases() method with offset should respond less quantity', function (done) {

      if (mock) {
        nock('https://ord.databases.api.rackspacecloud.com')
          .get('/v1.0/537645/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .get('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases?marker=TestDatabase')
          .reply(200, { databases: [{ name: 'TestDatabaseTwo '}] });
      }

      helpers.selectInstance(client, function (instance) {
        client.getDatabases({ instance: instance, offset: testContext.marker },
          function(err, instances, offset) {
            assert.isNull(err);
            assert.isArray(instances);
            assert.equal(instances.length, 1);
            assert.isNull(offset);
            done();
        });
      });
    });

    it('the getDatabases() method with limit and offset ' +
      'should respond just one result with no more next points', function (done) {

      if (mock) {
        nock('https://ord.databases.api.rackspacecloud.com')
          .get('/v1.0/537645/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .get('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases?limit=1&marker=TestDatabase')
          .reply(200, { databases: [{ name: 'TestDatabaseTwo' }] });
      }

      helpers.selectInstance(client, function (instance) {
        client.getDatabases({ instance: instance, limit: 1, offset: testContext.marker },
          function (err, instances, offset) {
            assert.isNull(err);
            assert.isArray(instances);
            assert.equal(instances.length, 1);
            assert.isNull(offset);
            done();
          });
      });
    });

    it('the destroyDatabase() method with first db should respond correctly', function (done) {

      if (mock) {
        nock('https://ord.databases.api.rackspacecloud.com')
          .get('/v1.0/537645/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .delete('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases/TestDatabase')
          .reply(202);
      }

      helpers.selectInstance(client, function (instance) {
        client.destroyDatabase('TestDatabase', instance, function(err, response) {
          assert.isNull(err);
          assert.equal(response.statusCode, 202);
          done();
        });
      });
    });

    it('the destroyDatabase() method with last db should respond correctly', function (done) {

      if (mock) {
        nock('https://ord.databases.api.rackspacecloud.com')
          .get('/v1.0/537645/instances')
          .reply(200, helpers.loadFixture('rackspace/databaseInstances.json'))
          .delete('/v1.0/537645/instances/51a28a3e-2b7b-4b5a-a1ba-99b871af2c8f/databases/TestDatabaseTwo')
          .reply(202);
      }

      helpers.selectInstance(client, function (instance) {
        client.destroyDatabase('TestDatabaseTwo', instance, function (err, response) {
          assert.isNull(err);
          assert.equal(response.statusCode, 202);
          done();
        });
      });
    });

  });
});

