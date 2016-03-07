'use strict';

var should = require('should'),
  async = require('async'),
  helpers = require('../../helpers'),
  hock = require('hock'),
  http = require('http'),
  mock = !!process.env.MOCK;

var setupSetTemporaryUrlKeyMock, setupGetTemporaryUrlKeyMock, setupGenerateTempUrlKeyMock;

describe('pkgcloud/openstack/storage', function(){
  var client, authHockInstance, hockInstance,
    authServer, server;

    beforeEach(function (done) {
      client = helpers.createClient('openstack', 'storage');

      if(!mock) {
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

    afterEach(function (done) {
      client = null;
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

    it('the client.getTemporaryUrlKey() method should return the temporary url key', function(done){
      if(mock) {
        setupGetTemporaryUrlKeyMock(client, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.getTemporaryUrlKey(function (err, temporaryUrlKey) {
        should.not.exist(err);
        should.exist(temporaryUrlKey);

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();

        done();
      });
    });

    it('the client.setTemporaryUrlKey() method should have the proper header', function(done){
      if(mock) {
        setupSetTemporaryUrlKeyMock(client, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.setTemporaryUrlKey('54321', function (err) {
        should.not.exist(err);

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();

        done();
      });
    });

    it('the client.generateTempUrl() method should return the temporary url', function(done){
      if(mock) {
        setupGenerateTempUrlKeyMock(client, {
          authServer: authHockInstance,
          server: hockInstance
        });
      }

      client.generateTempUrl('container', 'file', 'GET', 60, '12345', function (err, temporaryUrl) {
        should.not.exist(err);
        should.exist(temporaryUrl);

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();

        done();
      });
    });
});

setupGetTemporaryUrlKeyMock = function (client, servers) {
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
  .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00')
  .reply(200, null, {'x-account-meta-temp-url-key': '12345'});
};

setupSetTemporaryUrlKeyMock = function (client, servers) {
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
  .post('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00', null, {'x-account-meta-temp-url-key': '54321'})
  .reply(201);
};

setupGenerateTempUrlKeyMock = function (client, servers) {
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
};
