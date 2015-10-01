/*
* databases-test.js: Tests for MongoHQ databases service
*
* (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
* MIT LICENSE
*
*/

var helpers = require('../../helpers'),
  should = require('should'),
  hock = require('hock'),
  http = require('http'),
  mock = !!process.env.MOCK;

describe('pkgcloud/mongohq/databases', function () {
  var context = {}, client, hockInstance, server;

  before(function (done) {
    client = helpers.createClient('mongohq', 'database');

    if (!mock) {
      return done();
    }

    hockInstance = hock.createHock();
    server = http.createServer(hockInstance.handler);
    server.listen(12345, done);
  });

  it('the create() method with correct options should respond correctly', function (done) {

    if (mock) {
      hockInstance
        .post('/provider/resources', 'app_id=testDatabase&plan=free')
        .reply(200, helpers.loadFixture('mongohq/database.json'));
    }

    client.create({
      plan: 'free',
      name: 'testDatabase'
    }, function (err, database) {
      should.not.exist(err);
      should.exist(database);
      should.exist(database.id);
      should.exist(database.uri);
      should.exist(database.username);
      should.exist(database.password);
      context.databaseId = database.id;

      hockInstance && hockInstance.done();
      done();
    });
  });

  it('the remove() method with correct options should respond correctly', function (done) {

    if (mock) {
      hockInstance
        .delete('/provider/resources/63562')
        .reply(200, 'OK');
    }

    client.remove(context.databaseId, function (err, confirm) {
      should.not.exist(err);
      should.exist(confirm);
      confirm.should.equal('deleted');

      hockInstance && hockInstance.done();
      done();
    });
  });

  describe('the create() method with invalid options like', function () {
    it('no options should respond with errors', function (done) {
      client.create(function (err, database) {
        should.exist(err);
        should.not.exist(database);
        done();
      });
    });

    it('no invalid options should respond with errors', function (done) {
      client.create({ invalid: 'keys' }, function (err, database) {
        should.exist(err);
        should.not.exist(database);
        done();
      });
    });
  });

  describe('the remove() method with invalid options like', function () {
    it('no options should respond with errors', function (done) {
      client.remove(function (err, database) {
        should.exist(err);
        should.not.exist(database);
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
