/*
* databases-test.js: Tests for Redistogo databases service
*
* (C) 2012 Nodejitsu Inc.
* MIT LICENSE
*
*/

var should  = require('should'),
    helpers = require('../../helpers'),
    nock    = require('nock'),
    mock    = !!process.env.NOCK;

describe('pkgcloud/redistogo/databases', function () {
  var testContext = {}, n,
      client = helpers.createClient('redistogo', 'database');

  describe('The pkgcloud RedisToGo Database client', function () {
    describe('the create method()', function() {
      it('with correct options should respond correctly', function(done) {

        if (mock) {
          n = nock('https://redistogo.com')
            .post('/instances.json', "instance%5Bplan%5D=nano")
            .reply(201, helpers.loadFixture('redistogo/database.json'))
        }

        client.create({ plan: 'nano' }, function(err, database) {
          should.not.exist(err);
          should.exist(database);
          should.exist(database.id);
          should.exist(database.uri);
          should.exist(database.username);
          should.exist(database.password);
          testContext.databaseId = database.id;
          n.done();
          done();
        });
      });

      it('with no options should respond with errors', function (done) {
        client.create(function (err, database) {
          should.exist(err);
          should.not.exist(database);
          done();
        });
      });
    });

    describe('the get() method', function() {
      it('with correct options should respond correctly', function(done) {
        if (mock) {
          n = nock('https://redistogo.com')
            .get('/instances/253739.json')
            .reply(200, helpers.loadFixture('redistogo/database.json'))
        }

        client.get(testContext.databaseId, function (err, database) {
          should.not.exist(err);
          should.exist(database);
          should.exist(database.id);
          should.exist(database.uri);
          should.exist(database.username);
          should.exist(database.password);
          n.done();
          done();
        });
      });

      it('with options should respond with an error', function(done) {
        client.get(function(err, database) {
          should.exist(err);
          should.not.exist(database);
          done();
        });
      });
    });

    describe('the remove() method', function () {
      it('with correct options should respond correctly', function (done) {
        if (mock) {
          n = nock('https://redistogo.com')
            .delete('/instances/253739.json')
            .reply(200);
        }

        client.remove(testContext.databaseId, function (err, confirm) {
          should.not.exist(err);
          should.exist(confirm);
          confirm.should.equal('deleted');
          n.done();
          done();
        });
      });

      it('with options should respond with an error', function (done) {
        client.remove(function (err, confirm) {
          should.exist(err);
          should.not.exist(confirm);
          done();
        });
      });
    });
  });
});

