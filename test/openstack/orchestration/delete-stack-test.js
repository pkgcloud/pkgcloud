/*
 * delete-stack-test.js: Unit tests for deleting OpenStack Orchestration (Heat) stacks
 *
 * (C) 2015 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

var helpers = require('../../helpers');

var should = require('should'),
  async = require('async'),
  hock = require('hock'),
  http = require('http'),
  mock = !!process.env.MOCK,
  Stack = require('../../../lib/pkgcloud/openstack/orchestration/stack').Stack;

var client = helpers.createClient('openstack', 'orchestration');

// Declaring variables for helper functions defined later
var setupDeleteStackWithObjectMock, setupDeleteStackWithNameMock;

describe('pkgcloud/openstack/orchestration/stacks[deleteStack]', function () {

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

  it('the deleteStack method with a stack object should delete the stack', function (done) {
    if (mock) {
      setupDeleteStackWithObjectMock({
        authServer: authHockInstance,
        server: hockInstance
      });
    }

    var stack = new Stack(client, { id: '87xxxx1-9xx9-4xxe-bxxf', stack_name: 'emptystack' });
    client.deleteStack(stack, function (err, success) {
      should.not.exist(err);
      success.should.equal(true);

      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });
  });

  it('the deleteStack method with a stack name should delete the stack', function (done) {
    if (mock) {
      setupDeleteStackWithNameMock({
        authServer: authHockInstance,
        server: hockInstance
      });
    }

    client.deleteStack('emptystack', function (err, success) {
      should.not.exist(err);
      success.should.equal(true);

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

setupDeleteStackWithObjectMock = function(servers) {
  servers.authServer
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

  servers.server
    .delete('/v1/72e90ecb69c44d0296072ea39e537041/stacks/emptystack/87xxxx1-9xx9-4xxe-bxxf')
    .reply(204);
};

setupDeleteStackWithNameMock = function(servers) {
  servers.server
    .get('/v1/72e90ecb69c44d0296072ea39e537041/stacks/emptystack')
    .reply(302, null, { 'Location': '/v1/72e90ecb69c44d0296072ea39e537041/stacks/emptystack/87xxxx1-9xx9-4xxe-bxxf' })
    .get('/v1/72e90ecb69c44d0296072ea39e537041/stacks/emptystack/87xxxx1-9xx9-4xxe-bxxf')
    .reply(200, { stack: { id: '87xxxx1-9xx9-4xxe-bxxf', stack_name: 'emptystack' } })
    .delete('/v1/72e90ecb69c44d0296072ea39e537041/stacks/emptystack/87xxxx1-9xx9-4xxe-bxxf')
    .reply(204);
};
