/*
 * get-stack-resources-test.js: Test Methods for OpenStack Heat stack resources
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
  mock = !!process.env.MOCK;

var client = helpers.createClient('openstack', 'orchestration');

describe('pkgcloud/openstack/orchestration/resources[getResources]', function() {

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

  it('the getResources method should return an empty array', function (done) {
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
        .get('/v1/72e90ecb69c44d0296072ea39e537041/stacks/emptystack')
        .reply(302, {}, { Location: 'http://localhost:12345/v1/72e90ecb69c44d0296072ea39e537041/stacks/emptystack/87xxxx1-9xx9-4xxe-bxxf-a7xxxxx068' })
        .get('/v1/72e90ecb69c44d0296072ea39e537041/stacks/emptystack/87xxxx1-9xx9-4xxe-bxxf-a7xxxxx068')
        .reply(200, { stack: { id: '87xxxx1-9xx9-4xxe-bxxf-a7xxxxx068', stack_name: 'emptystack' }})
        .get('/v1/72e90ecb69c44d0296072ea39e537041/stacks/emptystack/87xxxx1-9xx9-4xxe-bxxf-a7xxxxx068/resources')
        .reply(200, { resources: [] });
    }

    client.getResources('emptystack', function (err, resources) {
      should.not.exist(err);
      resources.should.be.an.Array;
      resources.length.should.equal(0);
      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });

  });

  it('the getResources method with nested_depth should pass option correctly', function (done) {
    if (mock) {
      hockInstance
        .get('/v1/72e90ecb69c44d0296072ea39e537041/stacks/emptystack')
        .reply(302, {}, { Location: 'http://localhost:12345/v1/72e90ecb69c44d0296072ea39e537041/stacks/emptystack/87xxxx1-9xx9-4xxe-bxxf-a7xxxxx068' })
        .get('/v1/72e90ecb69c44d0296072ea39e537041/stacks/emptystack/87xxxx1-9xx9-4xxe-bxxf-a7xxxxx068')
        .reply(200, { stack: { id: '87xxxx1-9xx9-4xxe-bxxf-a7xxxxx068', stack_name: 'emptystack' }})
        .get('/v1/72e90ecb69c44d0296072ea39e537041/stacks/emptystack/87xxxx1-9xx9-4xxe-bxxf-a7xxxxx068/resources?nested_depth=3')
        .reply(200, { resources: [] });
    }

    client.getResources('emptystack', { nestedDepth: 3 }, function (err, resources) {
      console.log(err);
      should.not.exist(err);
      resources.should.be.an.Array;
      resources.length.should.equal(0);
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
