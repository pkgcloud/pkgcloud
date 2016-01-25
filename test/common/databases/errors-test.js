/*
* errors-test.js: Tests for Openstack Trove client errors
*
* (C) 2014 Hewlett-Packard Development Company, L.P.
*
*/

var should = require('should'),
    helpers = require('../../helpers'),
    providers = require('../../configs/providers.json');

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].database && provider !== 'azure';
}).forEach(function (provider) {
  describe('pkgcloud/['+provider+']/databases/errors', function() {
    var client = helpers.createClient(provider, 'database');

    describe('The pkgcloud '+provider+' Database client', function() {
      describe('breaking the function', function() {

        it('createInstance() when no options should return an error', function(done) {
          client.createInstance(function(err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('createInstance() with bad options should return an error', function (done) {
          client.createInstance({}, function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('createInstance() with no instance options should return an error', function (done) {
          client.createInstance({ name: 'shouldGetError' }, function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('destroyInstance() with no instance should return an error', function (done) {
          client.destroyInstance(function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('getInstance() with no instance should return an error', function (done) {
          client.getInstance(function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('createDatabase() with no options should return an error', function (done) {
          client.createDatabase(function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('createDatabase() with no instance should return an error', function (done) {
          client.createDatabase({ name: 'shouldGetError' }, function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('getDatabases() with no instance should return an error', function (done) {
          client.getDatabases(function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('destroyDatabase() with no options should return an error', function (done) {
          client.destroyDatabase(function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('destroyDatabase() with no instance should return an error', function (done) {
          client.destroyDatabase('shouldGetError', function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('createUser() with no options should return an error', function (done) {
          client.createUser(function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('createUser() with empty objects should return an error', function (done) {
          client.createUser({}, function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('createUser() with no db or instance should return an error', function (done) {
          client.createUser({
            username: 'testing',
            password: 'shouldFail'
          }, function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('createUser() with no instance should return an error', function (done) {
          client.createUser({
            username: 'testing',
            password: 'shouldFail',
            database: 'none'
          }, function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('getUsers() with no instance should return an error', function (done) {
          client.getUsers(function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('destroyUser() with no instance should return an error', function (done) {
          client.destroyUser(function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('destroyUser() with no user should return an error', function (done) {
          client.destroyUser('shouldGetError', function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('enableRoot() with no instance should return an error', function (done) {
          client.enableRoot(function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });

        it('rootEnabled() with no instance should return an error', function (done) {
          client.rootEnabled(function (err, instance) {
            should.exist(err);
            should.not.exist(instance);
            done();
          });
        });
      });
    });
  });
});
