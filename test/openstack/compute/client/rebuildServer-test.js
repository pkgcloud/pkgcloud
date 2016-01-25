/*
 * rebuildServer-test.js: Test for rebuilding servers
 *
 * (C) 2015 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

var helpers = require('../../../helpers');

var should = require('should'),
    async = require('async'),
    hock = require('hock'),
    http = require('http'),
    compute = require('../../../../lib/pkgcloud/openstack/compute'),
    mock = !!process.env.MOCK;

var client = helpers.createClient('openstack', 'compute');

// Declaring variables for helper functions defined later
var setupRebuildServerWithImageIdMock, setupRebuildServerWithImageObjMock,
    setupRebuildServerWithOptionsMock;

describe('pkgcloud/openstack/compute/server[openstack]', function() {
  
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

  it('the server.rebuildServer() method with image ID should rebuild a server instance', function (done) {
    if (mock) {
      setupRebuildServerWithImageIdMock({
        authServer: authHockInstance,
        server: hockInstance
      });
    }

    client.rebuildServer('a2e90ecb69c44d0296072ea39e53704a', 'd42f821e-c2d1-4796-9f07-af5ed7912d0e', function (err) {
      should.not.exist(err);
      
      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();
      
      done();
    });
  });

  it('the server.rebuildServer() method with image object should rebuild a server instance', function (done) {
    if (mock) {
      setupRebuildServerWithImageObjMock({
        authServer: authHockInstance,
        server: hockInstance
      });
    }

    var imageObj = new compute.Image(client, { id: 'd42f821e-c2d1-4796-9f07-af5ed7912d0e' });
    client.rebuildServer('a2e90ecb69c44d0296072ea39e53704a', imageObj, function (err) {
      should.not.exist(err);
      
      authHockInstance && authHockInstance.done();
      hockInstance && hockInstance.done();
      
      done();
    });
  });

  it('the server.rebuildServer() method with options should rebuild a server instance', function (done) {
    if (mock) {
      setupRebuildServerWithOptionsMock({
        authServer: authHockInstance,
        server: hockInstance
      });
    }

    var options = {
      image: 'd42f821e-c2d1-4796-9f07-af5ed7912d0e',
      adminPass: 'foobar'
    };
    client.rebuildServer('a2e90ecb69c44d0296072ea39e53704a', options, function (err) {
      should.not.exist(err);
      
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

setupRebuildServerWithImageIdMock = function(servers) {
  servers.authServer
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
  
  servers.server
    .post('/v2/72e90ecb69c44d0296072ea39e537041/servers/a2e90ecb69c44d0296072ea39e53704a/action',
          { 'rebuild': { 'imageRef': 'd42f821e-c2d1-4796-9f07-af5ed7912d0e' } })
    .reply(202, '');
};

setupRebuildServerWithImageObjMock = function(servers) {
  servers.server
    .post('/v2/72e90ecb69c44d0296072ea39e537041/servers/a2e90ecb69c44d0296072ea39e53704a/action',
          { 'rebuild': { 'imageRef': 'd42f821e-c2d1-4796-9f07-af5ed7912d0e' } })
    .reply(202, '');
};

setupRebuildServerWithOptionsMock = function(servers) {
  servers.server
    .post('/v2/72e90ecb69c44d0296072ea39e537041/servers/a2e90ecb69c44d0296072ea39e53704a/action',
          { 'rebuild': { 'adminPass': 'foobar', 'imageRef': 'd42f821e-c2d1-4796-9f07-af5ed7912d0e' } })
    .reply(202, '');
};
