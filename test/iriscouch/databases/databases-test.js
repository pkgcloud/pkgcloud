/*
 * databases-test.js: Tests for IrisCouch database service
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

describe('pkgcloud/iriscouch/databases', function () {
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

  it('the create() method with correct options should respond correctly', function (done) {
    var subdomain = (mock ? 'nodejitsudb908' : 'nodejitsudb' + Math.floor(Math.random() * 100000));

    if (mock) {

      client._getCouchPollingUrl = function() {
        return 'http://localhost:12345';
      };

      hockInstance
        .post('/hosting_public', helpers.loadFixture('iriscouch/database.json'))
        .reply(201, {
          ok: true,
          id: 'Server/nodejitsudb908',
          rev: '1-dc91e4ee524420e6f32607b0c24151de'
        })
        .get('/')
        .reply(200);
    }

    client.create({
      subdomain: subdomain,
      first_name: 'Marak',
      last_name: 'Squires',
      email: 'marak.squires@gmail.com'
    }, function (err, database) {
      should.not.exist(err);
      should.exist(database);
      should.exist(database.id);
      should.exist(database.uri);
      context.databaseId = database.id;

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
