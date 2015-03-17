/*
* databases-test.js: Tests for MongoLab databases service
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

describe('pkgcloud/mongolab/databases', function () {
  var context = {}, client, hockInstance, server;

  before(function (done) {
    client = helpers.createClient('mongolab', 'database');

    if (!mock) {
      return done();
    }

    hockInstance = hock.createHock();
    server = http.createServer(hockInstance.handler);
    server.listen(12345, done);
  });

  it('the createAccount() method with correct options should respond correctly', function (done) {

    if (mock) {
      hockInstance
        .post('/api/1/partners/nodejitsu/accounts', {
          name: 'nodejitsu_daniel',
          adminUser: {
            email: 'daniel@nodejitsu.com'
          }
        })
        .reply(200, helpers.loadFixture('mongolab/user.json'));
    }

    client.createAccount({
      name: 'daniel',
      email: 'daniel@nodejitsu.com'
    }, function (err, response) {
      should.not.exist(err);
      should.exist(response);
      should.exist(response.account);
      should.exist(response.account.username);
      should.exist(response.account.email);
      should.exist(response.account.password);
      context.account = response.account;

      hockInstance && hockInstance.done();
      done();
    });
  });

//  it('the remove() method with correct options should respond correctly', function (done) {
//
//    if (mock) {
//      server
//        .delete('/provider/resources/63562')
//        .reply(200, 'OK');
//    }
//
//    client.remove(context.databaseId, function (err, confirm) {
//      should.not.exist(err);
//      should.exist(confirm);
//      confirm.should.equal('deleted');
//      ;
//
//      server && server.done();
//      done();
//    });
//  });

  describe('the createAccount() method with invalid options like', function () {
    it('no options should respond with errors', function (done) {
      client.createAccount(function (err, database) {
        should.exist(err);
        should.not.exist(database);
        done();
      });
    });

    it('no invalid options should respond with errors', function (done) {
      client.createAccount({ invalid: 'keys' }, function (err, database) {
        should.exist(err);
        should.not.exist(database);
        done();
      });
    });

    it('no email should respond with errors', function (done) {
      client.createAccount({ name: 'testDatabase' }, function (err, database) {
        should.exist(err);
        should.not.exist(database);
        done();
      });
    });
  });

  describe('the createAccount() method with custom passwords with', function () {
    it('no numbers should respond with errors', function(done) {
      client.createAccount({
        name: 'custompassword',
        email: 'custom@password.com',
        password: 'mycustompassword'
      }, function(err, response) {
        should.exist(err);
        should.not.exist(response);

        done();
      });
    });

    it('with numbers should respond with success', function(done) {

      if (mock) {
        hockInstance
          .post('/api/1/partners/nodejitsu/accounts', {
            name: 'nodejitsu_custompassword',
            adminUser: {
              email: 'custom@password.com',
              password: 'my1custom2password'
            }
          })
          .reply(200, helpers.loadFixture('mongolab/customUser.json'));
      }

      client.createAccount({
        name: 'custompassword',
        email: 'custom@password.com',
        password: 'my1custom2password'
      }, function(err, response) {
        should.not.exist(err);
        should.exist(response);
        should.exist(response.account);
        should.exist(response.account.username);
        should.exist(response.account.email);
        context.custompw = response.account;

        hockInstance && hockInstance.done();
        done();
      });
    });
  });

  it('the getAccounts() method should respond with all accounts', function(done) {

    if (mock) {
      hockInstance
        .get('/api/1/partners/nodejitsu/accounts')
        .reply(200, helpers.loadFixture('mongolab/userList.json'));
    }

    client.getAccounts(function(err, accounts) {
      should.not.exist(err);
      should.exist(accounts);
      accounts.should.be.an.Array;
      accounts.should.have.length(2);
      accounts.forEach(function(account) {
        should.exist(account.username);
        should.exist(account.email);
      });

      hockInstance && hockInstance.done();
      done();
    });
  });

  it('the getAccount() method should return the matching account', function(done) {

    if (mock) {
      hockInstance
        .get('/api/1/partners/nodejitsu/accounts/nodejitsu_daniel')
        .reply(200, {
          name: 'nodejitsu_daniel',
          adminUser: {
            username: 'nodejitsu_daniel',
            email: 'daniel@nodejitsu.com'
          }
        });
    }

    client.getAccount(context.account.username, function (err, account) {
      should.not.exist(err);
      should.exist(account);
      account.username.should.equal(context.account.username);
      account.email.should.equal(context.account.email);

      hockInstance && hockInstance.done();
      done();
    });

  });

  it('the create() method with correct options should respond correctly', function (done) {

    if (mock) {
      hockInstance
        .post('/api/1/partners/nodejitsu/accounts/nodejitsu_daniel/databases', helpers.loadFixture('mongolab/reqDatabase.json'))
        .reply(200, helpers.loadFixture('mongolab/database.json'));
    }

    client.create({
      plan:'free',
      name:'testDatabase',
      owner: context.account.username
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

    it('no plan should respond with errors', function (done) {
      client.create({ name: 'testDatabase' }, function (err, database) {
        should.exist(err);
        should.not.exist(database);
        done();
      });
    });
  });

  describe('the getDatabases() method', function() {
    it('with valid options should respond correctly', function (done) {

      if (mock) {
        hockInstance
          .get('/api/1/partners/nodejitsu/accounts/nodejitsu_daniel/databases')
          .reply(200, [ { name : 'nodejitsu_daniel_testDatabase' } ]);
      }

      client.getDatabases(context.account.username, function (err, databases) {
        should.not.exist(err);
        should.exist(databases);
        databases.should.be.an.Array;
        databases.should.have.length(1);
        databases[0].should.be.a.Object;
        databases[0].name.should.equal(context.account.username + '_testDatabase');
        context.databaseName = databases[0].name;

        hockInstance && hockInstance.done();
        done();
      });
    });

    it('with invalid options should respond with errors', function(done) {
      client.getDatabases(function(err, databases) {
        should.exist(err);
        should.not.exist(databases);

        done();
      });
    });
  });

  describe('the getDatabase() method', function () {
    it('with valid options should respond correctly', function (done) {

      if (mock) {
        hockInstance
          .get('/api/1/partners/nodejitsu/accounts/nodejitsu_daniel/databases/nodejitsu_daniel_testDatabase')
          .reply(200, { name : 'nodejitsu_daniel_testDatabase' });
      }

      client.getDatabase({
        owner: context.account.username,
        name: context.databaseName },
        function (err, database) {
          should.not.exist(err);
          should.exist(database);
          database.should.be.a.Object;
          database.name.should.equal(context.account.username + '_testDatabase');

          hockInstance && hockInstance.done();
          done();
        });
    });

    it('with invalid options should respond with errors', function (done) {
      client.getDatabase(function (err, databases) {
        should.exist(err);
        should.not.exist(databases);

        done();
      });
    });

    it('with no owner should respond with errors', function (done) {
      client.getDatabase({ name: 'no-owner' }, function (err, databases) {
        should.exist(err);
        should.not.exist(databases);

        done();
      });
    });

    it('with no name should respond with errors', function (done) {
      client.getDatabase({ owner: 'no-name' }, function (err, databases) {
        should.exist(err);
        should.not.exist(databases);

        done();
      });
    });
  });

  describe('the remove() method', function () {
    it('with valid options should respond correctly', function (done) {

      if (mock) {
        hockInstance
          .delete('/api/1/partners/nodejitsu/accounts/nodejitsu_daniel/databases/nodejitsu_daniel_testDatabase')
          .reply(200, ' null ');
      }

      client.remove({
          owner: context.account.username,
          name: context.databaseName },
        function (err) {
          should.not.exist(err);

          hockInstance && hockInstance.done();
          done();
        });
    });

    it('and have no databases left after getDatabases()', function (done) {

      if (mock) {
        hockInstance
          .get('/api/1/partners/nodejitsu/accounts/nodejitsu_daniel/databases')
          .reply(200, []);
      }

      client.getDatabases(context.account.username, function (err, databases) {
        should.not.exist(err);
        should.exist(databases);
        databases.should.be.an.Array;
        databases.should.have.length(0);

        hockInstance && hockInstance.done();
        done();
      });
    });

    it('with invalid options should respond with errors', function (done) {
      client.remove(function (err, databases) {
        should.exist(err);
        should.not.exist(databases);

        done();
      });
    });

    it('with no owner should respond with errors', function (done) {
      client.remove({ name: 'no-owner' }, function (err, databases) {
        should.exist(err);
        should.not.exist(databases);

        done();
      });
    });

    it('with no name should respond with errors', function (done) {
      client.remove({ owner: 'no-name' }, function (err, databases) {
        should.exist(err);
        should.not.exist(databases);

        done();
      });
    });
  });

  describe('the deleteAccount() method', function () {
    it('with valid options should respond correctly', function (done) {

      if (mock) {
        hockInstance
          .delete('/api/1/partners/nodejitsu/accounts/nodejitsu_daniel')
          .reply(200, ' null ');
      }

      client.deleteAccount(context.account.username,
        function (err) {
          should.not.exist(err);

          hockInstance && hockInstance.done();
          done();
        });
    });

    it('and delete the other account', function (done) {

      if (mock) {
        hockInstance
          .delete('/api/1/partners/nodejitsu/accounts/nodejitsu_custompassword')
          .reply(200, ' null ');
      }

      client.deleteAccount(context.custompw.username, function (err) {
        should.not.exist(err);

        hockInstance && hockInstance.done();
        done();
      });
    });

    it('with invalid options should respond with errors', function (done) {
      client.deleteAccount(function (err, databases) {
        should.exist(err);
        should.not.exist(databases);

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
