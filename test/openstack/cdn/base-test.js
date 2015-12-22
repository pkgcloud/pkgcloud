/*
 * base-resource-test.js: Unit tests for the CDN service's base resources
 *
 * (C) 2014 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

var helpers = require('../../helpers'),
    mock = !!process.env.MOCK,
    hock = require('hock'),
    http = require('http'),
    async = require('async'),
    should = require('should');

// Declaring variables for helper functions defined later
var setupGetHomeDocumentMock, setupGetPingMock;

describe('pkgcloud/openstack/cdn/base', function() {

  // Create CDN service client
  var client = helpers.createClient('openstack', 'cdn'),
    authHockInstance, hockInstance,
    authServer, server;

  // Runs before all unit tests are run
  before(function (done) {

    if (!mock) {
      return done();
    }

    // Spin up an authentication server as well as a CDN flavor server
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

  // Runs after all unit tests have run
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

  // Unit tests follow...

  it('the client.getHomeDocument() method should return the home document', function(done) {

    if (mock) {
      setupGetHomeDocumentMock(client, {
        authServer: authHockInstance,
        server: hockInstance
      });
    }

    client.getHomeDocument(function (err, homeDocument) {
      should.not.exist(err);
      should.exist(homeDocument);

      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });
  });

  it('the client.getPing() method should return the ping response', function(done) {

    if (mock) {
      setupGetPingMock(client, {
        authServer: authHockInstance,
        server: hockInstance
      });
    }

    client.getPing(function (err) {
      should.not.exist(err);

      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();

      done();
    });
  });

});

setupGetHomeDocumentMock = function (client, servers) {
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
    .get('/v1.0/72e90ecb69c44d0296072ea39e537041/')
    .replyWithFile(200, __dirname + '/../../fixtures/openstack/cdnHomeDocument.json');
};

setupGetPingMock = function (client, servers) {
  servers.server
    .get('/v1.0/72e90ecb69c44d0296072ea39e537041/ping')
    .reply(204);
};
