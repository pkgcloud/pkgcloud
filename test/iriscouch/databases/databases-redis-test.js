/*
* databases-redis-test.js: Tests for IrisCouch Redis database service
*
* (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
* MIT LICENSE
*
*/

var helpers = require('../../helpers'),
    should  = require('should'),
    hock    = require('hock'),
    http    = require('http'),
    mock    = !!process.env.MOCK;

// Declaring variables for helper functions defined later
var randomPassword;

describe('pkgcloud/iriscouch/databases-redis', function () {
  var context = {}, client, hockInstance, server;

  before(function (done) {
    client = helpers.createClient('iriscouch', 'database');

    if (!mock) {
      return done();
    }

    hockInstance = hock.createHock();
    server = http.createServer(hockInstance.handler);
    server.listen(12345, done);
  });

  it('the create() method with correct options should respond correctly', function(done) {
    var subdomain = (mock ? 'nodejitsudb43639' : 'nodejitsudb' + Math.floor(Math.random() * 100000));
    context.tempPassword = (mock ? 'sTTi:lh9vCF[' : randomPassword(12).replace('\\', ''));

    if (mock) {
      hockInstance
        .post('/hosting_public', helpers.loadFixture('iriscouch/database-redis.json'))
        .reply(201, { ok: true,
          id: 'Redis/nodejitsudb43639',
          rev: '1-63cf360ebc115cdc8a709a910fdef6d7'
        });
    }

    client.create({
      subdomain: subdomain,
      first_name: 'Marak',
      last_name: 'Squires',
      email: 'marak.squires@gmail.com',
      type: 'redis', // For redis instead of couch just put type to redis
      password: context.tempPassword
    }, function(err, database) {
      should.not.exist(err);
      should.exist(database);
      should.exist(database.id);
      should.exist(database.uri);
      context.databaseId = database.id;
      database.password.should.equal([database.host, context.tempPassword].join(':'));

      hockInstance && hockInstance.done();
      done();
    });
  });

  describe('the create() method with invalid options like', function() {
    it('no options should respond with errors', function(done) {
      client.create(function(err, database) {
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

    it('no email should respond with errors', function (done) {
      client.create({
          subdomain: 'testDatabase',
          first_name: 'Daniel',
          last_name: 'Aristizabal'},
        function (err, database) {
          should.exist(err);
          should.not.exist(database);
          done();
        });
    });

    it('no subdomain should respond with errors', function (done) {
      client.create({
          email: 'daniel@nodejitsu.com',
          first_name: 'Daniel',
          last_name: 'Aristizabal'},
        function (err, database) {
          should.exist(err);
          should.not.exist(database);
          done();
        });
    });

    it('no names should respond with errors', function (done) {
      client.create({ email: 'daniel@nodejitsu.com', subdomain: 'testDatabase'},
        function (err, database) {
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

//
// Just a quick and lazy random password generator
//
randomPassword = function(length) {
  if (length == 1) {
    return String.fromCharCode(Math.floor(Math.random() * (122 - 48 + 1)) + 48);
  }
  return String.fromCharCode(Math.floor(Math.random() * (122 - 48 + 1)) + 48) + randomPassword(length - 1);
};
