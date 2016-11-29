/*
 * create-stacks-test.js: Test Methods for openstack heat stacks
 *
 * (C) 2014 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 */

var helpers = require('../../../helpers');

var should = require('should'),
  async = require('async'),
  hock = require('hock'),
  http = require('http'),
  network = require('../../../../lib/pkgcloud/openstack/network'),
  mock = !!process.env.MOCK;

var client = helpers.createClient('openstack', 'network');

describe('pkgcloud/openstack/network[createLoadbalancer]', function () {

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

  it('the create loadbalancer method should return a loadbalancer', function (done) {
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
        .replyWithFile(200, __dirname + '/../../../fixtures/openstack/initialToken.json')
        .get('/v2.0/tenants')
        .replyWithFile(200, __dirname + '/../../../fixtures/openstack/tenantId.json')
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
        .post('/v2.0/lbaas/loadbalancers', {
          'name': 'loadbalancer_unit_test',
          'description': 'simple loadbalancer',
          'project_id': '72e90ecb69c44d0296072ea39e537041',
          'tenant_id': '72e90ecb69c44d0296072ea39e537041',
          'vip_subnet_id': "123456789",
          'admin_state_up': false,
        })
        .reply(201, { "loadbalancer": {
          "admin_state_up": true,
          "description": "simple lb",
          "id": "a36c20d0-18e9-42ce-88fd-82a35977ee8c",
          "listeners": [],
          "name": "loadbalancer1",
          "operating_status": "ONLINE",
          "provisioning_status": "ACTIVE",
          "project_id": "b7c1a69e88bf4b21a8148f787aef2081",
          "tenant_id": "b7c1a69e88bf4b21a8148f787aef2081",
          "vip_address": "10.0.0.4",
          "vip_subnet_id": "013d3059-87a4-45a5-91e9-d721068ae0b2",
          "flavor": "a7ae5d5a-d855-4f9a-b187-af66b53f4d04",
          "provider": "sample_provider"
        }});
    }
    // client.createLoadbalancer({
    //   'name': 'loadbalancer_unit_test',
    //   'description': 'simple loadbalancer',
    //   'project_id': '72e90ecb69c44d0296072ea39e537041',
    //   'tenant_id': '72e90ecb69c44d0296072ea39e537041',
    //   'vip_subnet_id': "123456789",
    //   'admin_state_up': false,
    // },function (err) {
    //   should.not.exist(err);
    //   // authHockInstance && authHockInstance.done();
    //   // hockInstance && hockInstance.done();
    //   done();
    // });
    done();
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
