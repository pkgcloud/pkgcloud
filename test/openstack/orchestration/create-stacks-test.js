/*
 * create-stacks-test.js: Test Methods for openstack heat stacks
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
  Stack = require('../../../lib/pkgcloud/openstack/orchestration/stack').Stack,
  mock = !!process.env.MOCK;

var client = helpers.createClient('openstack', 'orchestration');

describe('pkgcloud/openstack/orchestration/stacks[createStacks]', function () {

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

  it('the createStacks method should return a stack', function (done) {
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
        .post('/v1/72e90ecb69c44d0296072ea39e537041/stacks', {
          'stack_name': 'stack-test',
          environment: JSON.stringify({ parameters: { terms: true } }),
          'timeout_mins': 30,
          template_url: 'https://raw.githubusercontent.com/rackspace-orchestration-templates/minecraft/master/minecraft-server.yaml'
        })
        .reply(201, { stack:
        { id: 'b39ecc51-8ac0-4396-a178-17fdc63f5d40',
          links: [
            { href: 'http://localhost:12345//v1/72e90ecb69c44d0296072ea39e537041/stacks/stack-test/b39ecc51-8ac0-4396-a178-17fdc63f5d40',
              rel: 'self' }
          ] } })
        .get('/v1/72e90ecb69c44d0296072ea39e537041/stacks/b39ecc51-8ac0-4396-a178-17fdc63f5d40')
        .reply(301, {}, { Location: 'http://localhost:12345/v1/72e90ecb69c44d0296072ea39e537041/stacks/stack-test/b39ecc51-8ac0-4396-a178-17fdc63f5d40' })
        .get('/v1/72e90ecb69c44d0296072ea39e537041/stacks/stack-test/b39ecc51-8ac0-4396-a178-17fdc63f5d40')
        .replyWithFile(200, __dirname + '/../../fixtures/openstack/getStack-create-in-progress.json');
    }

    client.createStack({
      name: 'stack-test',
      timeout: 30,
      templateUrl: 'https://raw.githubusercontent.com/rackspace-orchestration-templates/minecraft/master/minecraft-server.yaml',
      environment: { parameters: { terms: true } }
    },function (err, stack) {
      should.not.exist(err);
      stack.should.be.instanceof(Stack);
      stack.name.should.equal('stack-test');
      stack.status.should.equal('CREATE_IN_PROGRESS');
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





