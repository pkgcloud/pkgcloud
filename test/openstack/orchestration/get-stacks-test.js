/*
 * get-stacks-test.js: Test Methods for openstack heat stacks
 *
 * (C) 2014 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 */

var helpers = require('../../helpers');

var should = require('should'),
  async = require('async'),
  hock = require('hock'),
  http = require('http'),
  mock = !!process.env.MOCK;

var client = helpers.createClient('openstack', 'orchestration');

describe('pkgcloud/openstack/orchestration/stacks[getStacks]', function () {

  var authHockInstance, hockInstance, authServer, server;

  before(function (done) {

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

  it('the getStacks method should return an empty array', function (done) {
    if (mock) {
      authHockInstance
        .post('/v2.0/tokens', {
          auth: {
            passwordCredentials: {
              username: 'MOCK-USERNAME',
              password: 'MOCK-PASSWORD'
            }
          }
        })
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/initialToken.json')
        .get('/v2.0/tenants')
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/tenantId.json')
        .post('/v2.0/tokens', {
          auth: {
            passwordCredentials: {
              username: 'MOCK-USERNAME',
              password: 'MOCK-PASSWORD'
            },
            tenantId: '72e90ecb69c44d0296072ea39e537041'
          }
        })
        .reply(200, helpers.getOpenstackAuthResponse());

      hockInstance
        .get('/v1/72e90ecb69c44d0296072ea39e537041/stacks')
        .reply(200, { stacks: [] });
    }

    client.getStacks(function (err, stacks) {
      should.not.exist(err);
      stacks.should.be.an.Array;
      stacks.length.should.equal(0);
      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });

  });

  it('the getStacks method with name should pass option correctly', function (done) {
    if (mock) {
      hockInstance
        .get('/v1/72e90ecb69c44d0296072ea39e537041/stacks?name=foo')
        .reply(200, { stacks: [] });
    }

    client.getStacks({ name: 'foo' }, function (err, stacks) {
      should.not.exist(err);
      stacks.should.be.an.Array;
      stacks.length.should.equal(0);
      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });

  });

  it('the getStacks method with sortDir should pass option correctly', function (done) {
    if (mock) {
      hockInstance
        .get('/v1/72e90ecb69c44d0296072ea39e537041/stacks?sort_dir=foo')
        .reply(200, { stacks: [] });
    }

    client.getStacks({ sortDir: 'foo' }, function (err, stacks) {
      should.not.exist(err);
      stacks.should.be.an.Array;
      stacks.length.should.equal(0);
      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });

  });

  it('the getStacks method with sortKeys should pass option correctly', function (done) {
    if (mock) {
      hockInstance
        .get('/v1/72e90ecb69c44d0296072ea39e537041/stacks?sort_keys=foo')
        .reply(200, { stacks: [] });
    }

    client.getStacks({ sortKeys: 'foo' }, function (err, stacks) {
      should.not.exist(err);
      stacks.should.be.an.Array;
      stacks.length.should.equal(0);
      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });

  });

  it('the getStacks method with status should pass option correctly', function (done) {
    if (mock) {
      hockInstance
        .get('/v1/72e90ecb69c44d0296072ea39e537041/stacks?status=foo')
        .reply(200, { stacks: [] });
    }

    client.getStacks({ status: 'foo' }, function (err, stacks) {
      should.not.exist(err);
      stacks.should.be.an.Array;
      stacks.length.should.equal(0);
      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });

  });

  it('the getStacks method with limit & marker should pass option correctly', function (done) {
    if (mock) {
      hockInstance
        .get('/v1/72e90ecb69c44d0296072ea39e537041/stacks?limit=10&marker=foo')
        .reply(200, { stacks: [] });
    }

    client.getStacks({ limit: 10, marker: 'foo' }, function (err, stacks) {
      should.not.exist(err);
      stacks.should.be.an.Array;
      stacks.length.should.equal(0);
      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
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
    ], done);
  });

});





