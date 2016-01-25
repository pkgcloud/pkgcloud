/*
* databases-test.js: Tests for azure tables databases service
*
* (C) Microsoft Open Technologies, Inc.
*
*/

var helpers = require('../../helpers'),
    http = require('http'),
    should = require('should'),
    urlJoin = require('url-join'),
    hock = require('hock'),
    mock = !!process.env.MOCK;

describe('pkgcloud/azure/databases', function () {

  var client, server, testContext = {}, hockInstance;

  before(function (done) {
    client = helpers.createClient('azure', 'database');

    if (!mock) {
      return done();
    }

    client._getUrl = function(options) {
      options = options || {};

      return urlJoin('http://localhost:12345/',
        (typeof options === 'string'
          ? options
          : options.path));
    };

    hockInstance = hock.createHock();
    hockInstance.filteringRequestBodyRegEx(/.*/, '*');

    server = http.createServer(hockInstance.handler);
    server.listen(12345, done);
  });

  describe('the pkgcloud azure db client', function() {
    it('the create() method with correct options should respond correctly', function(done) {

      if (mock) {
        hockInstance
          .post('/Tables', '*')
          .replyWithFile(201, __dirname + '/../../fixtures/azure/database/createTableResponse.xml');
      }

      client.create({
        name: 'testDatabase'
      }, function(err, database) {
        should.not.exist(err);
        should.exist(database);
        should.exist(database.id);
        should.exist(database.uri);
        database.username.should.equal('');
        database.password.should.equal('');
        testContext.databaseId = database.id;

        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the create() method with no options should error', function (done) {
      client.create(function (err, database) {
        should.exist(err);
        should.not.exist(database);
        done();
      });
    });

    it('the create() method with invalid options should error', function (done) {
      client.create({ invalid: 'keys' }, function (err, database) {
        should.exist(err);
        should.not.exist(database);
        done();
      });
    });

    it('the list() method with correct options should respond correctly', function (done) {

      if (mock) {
        hockInstance
          .get('/Tables')
          .replyWithFile(201, __dirname + '/../../fixtures/azure/database/listTables.xml');
      }

      client.list(function (err, databases) {
        should.not.exist(err);
        should.exist(databases);
        databases.should.be.an.Array;
        databases.should.have.length(1);

        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the remove() method with correct options should respond correctly', function (done) {

      if (mock) {
        hockInstance
          .delete('/Tables%28%27testDatabase%27%29')
          .reply(204, '', {'content-length': '0'});
      }

      client.remove(testContext.databaseId, function (err, result) {
        should.not.exist(err);
        result.should.equal(true);
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the remove() method with no options should error', function (done) {
      client.remove(function (err, result) {
        should.exist(err);
        should.not.exist(result);
        done();
      });
    });

  });

  after(function (done) {
    if (!mock) {
      return done();
    }

    server.close(done);
  });
});
