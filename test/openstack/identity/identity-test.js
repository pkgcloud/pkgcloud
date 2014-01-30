var identity = require('../../../lib/pkgcloud/openstack/identity'),
    should = require('should'),
    async = require('async'),
    helpers = require('../../helpers'),
    hock = require('hock'),
    mock = !!process.env.MOCK;

describe('pkgcloud/openstack/identity', function () {
  var server, adminServer;

  before(function (done) {

    if (!mock) {
      return done();
    }

    async.parallel([
      function(next) {
        hock.createHock(12346, function (err, hockClient) {
          should.not.exist(err);
          should.exist(hockClient);

          server = hockClient;
          next();
        });
      },
      function(next) {
        hock.createHock(12347, function (err, hockClient) {
          should.not.exist(err);
          should.exist(hockClient);

          adminServer = hockClient;
          next();
        });
      }], done);
  });

  describe('the pkgcloud openstack identity.createIdentity() function', function() {
    it('with valid inputs should return an identity', function(done) {

      if (mock) {
        server
          .post('/v2.0/tokens', {
            auth: {
              passwordCredentials: {
                username: 'MOCK-USERNAME',
                password: 'asdf1234'
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
                password: 'asdf1234'
              },
              tenantId: '72e90ecb69c44d0296072ea39e537041'
            }
          })
          .reply(200, helpers.getOpenstackAuthResponse());
      }

      var client = identity.createClient({
        authUrl: 'http://localhost:12346',
        username: 'MOCK-USERNAME',
        password: 'asdf1234',
        region: 'Calxeda-AUS1'
      });

      client.auth(function(err) {
        should.not.exist(err);
        server && server.done();
        done();
      });
    });

    it('with no tenants listed from /v2.0/tenants should return an error', function (done) {

      if (mock) {
        server
          .post('/v2.0/tokens', {
            auth: {
              passwordCredentials: {
                username: 'MOCK-USERNAME',
                password: 'asdf1234'
              }
            }
          })
          .replyWithFile(200, __dirname + '/../../fixtures/openstack/initialToken.json')
          .get('/v2.0/tenants')
          .replyWithFile(200, __dirname + '/../../fixtures/openstack/no-tenants.json');
      }

      var client = identity.createClient({
        authUrl: 'http://localhost:12346',
        username: 'MOCK-USERNAME',
        password: 'asdf1234',
        region: 'Calxeda-AUS1'});

      client.auth(function (err) {
        should.exist(err);
        err.message.should.equal('Unable to find tenants');

        server && server.done();
        done();
      });
    });

    it('user token should validate with admin token', function(done) {
      if (mock) {
        server
          .post('/v2.0/tokens', {
            auth: {
              passwordCredentials: {
                username: 'MOCK-USERNAME',
                password: 'asdf1234'
              }
            }
          })
          .replyWithFile(200, __dirname + '/../../fixtures/openstack/initialToken.json')
          .get('/v2.0/tenants', { 'X-Auth-Token': 'e93be67f91724754aeb9409c9c69d304' })
          .replyWithFile(200, __dirname + '/../../fixtures/openstack/tenantId.json')
          .post('/v2.0/tokens', {
            auth: {
              passwordCredentials: {
                username: 'MOCK-USERNAME',
                password: 'asdf1234'
              },
              tenantId: '72e90ecb69c44d0296072ea39e537041'
            }
          })
          .reply(200, helpers.getOpenstackAuthResponse());


        adminServer
          .post('/v2.0/tokens', {
            auth: {
              passwordCredentials: {
                username: 'MOCK-ADMIN',
                password: 'asdf1234'
              }
            }
          })
          .replyWithFile(200, __dirname + '/../../fixtures/openstack/initialToken-admin.json')
          .get('/v2.0/tenants', { 'X-Auth-Token': 'e93be67f91724754aeb9409c9c69d305' })
          .replyWithFile(200, __dirname + '/../../fixtures/openstack/tenantId-admin.json')
          .post('/v2.0/tokens', {
            auth: {
              passwordCredentials: {
                username: 'MOCK-ADMIN',
                password: 'asdf1234'
              },
              tenantId: '72e90ecb69c44d0296072ea39e537123'
            }
          })
          .reply(200, helpers._getOpenstackStandardResponse('../fixtures/openstack/realToken-admin.json'))
          .get('/v2.0/tokens/4bc7c5dabf3e4a49918683437d386b8a?belongsTo=72e90ecb69c44d0296072ea39e537041')
          .reply(200);
      }

      var userClient = identity.createClient({
        authUrl: 'http://localhost:12346',
        username: 'MOCK-USERNAME',
        password: 'asdf1234',
        region: 'Calxeda-AUS1'
      });

      var adminClient = identity.createClient({
        authUrl: 'http://localhost:12347',
        username: 'MOCK-ADMIN',
        password: 'asdf1234',
        useServiceCatalog: false,
        region: 'Calxeda-AUS1'
      });

      userClient.auth(function(err) {
        should.not.exist(err);
        should.exist(userClient._identity);

        adminClient.validateToken(userClient._identity.token.id,
          userClient._identity.token.tenant.id,
          function (err, body) {
            should.not.exist(err);
            done();
          });
      });
    });

    it('get the tenant info with admin token', function(done) {
      if (mock) {
        server
          .post('/v2.0/tokens', {
            auth: {
              passwordCredentials: {
                username: 'MOCK-USERNAME',
                password: 'asdf1234'
              }
            }
          })
          .replyWithFile(200, __dirname + '/../../fixtures/openstack/initialToken.json')
          .get('/v2.0/tenants', { 'X-Auth-Token': 'e93be67f91724754aeb9409c9c69d304' })
          .replyWithFile(200, __dirname + '/../../fixtures/openstack/tenantId.json')
          .post('/v2.0/tokens', {
            auth: {
              passwordCredentials: {
                username: 'MOCK-USERNAME',
                password: 'asdf1234'
              },
              tenantId: '72e90ecb69c44d0296072ea39e537041'
            }
          })
          .reply(200, helpers.getOpenstackAuthResponse())


        adminServer
          .post('/v2.0/tokens', {
            auth: {
              passwordCredentials: {
                username: 'MOCK-ADMIN',
                password: 'asdf1234'
              }
            }
          })
          .replyWithFile(200, __dirname + '/../../fixtures/openstack/initialToken-admin.json')
          .get('/v2.0/tenants', { 'X-Auth-Token': 'e93be67f91724754aeb9409c9c69d305' })
          .replyWithFile(200, __dirname + '/../../fixtures/openstack/tenantId-admin.json')
          .post('/v2.0/tokens', {
            auth: {
              passwordCredentials: {
                username: 'MOCK-ADMIN',
                password: 'asdf1234'
              },
              tenantId: '72e90ecb69c44d0296072ea39e537123'
            }
          })
          .reply(200, helpers._getOpenstackStandardResponse('../fixtures/openstack/realToken-admin.json'))
          .get('/v2.0/tenants/72e90ecb69c44d0296072ea39e537041', { 'X-Auth-Token': '4bc7c5dabf3e4a49918683437d386b8b' })
          .reply(200)
          .get('/v2.0/tenants/72e90ecb69c44d0296072ea39e537123', { 'X-Auth-Token': '4bc7c5dabf3e4a49918683437d386b8a' })
          .reply(403);

      }

      var userClient = identity.createClient({
        authUrl: 'http://localhost:12346',
        username: 'MOCK-USERNAME',
        password: 'asdf1234',
        region: 'Calxeda-AUS1'
      });

      var adminClient = identity.createClient({
        authUrl: 'http://localhost:12347',
        useAdmin: true,
        username: 'MOCK-ADMIN',
        password: 'asdf1234',
        useServiceCatalog: false,
        region: 'Calxeda-AUS1'
      });

      userClient.auth(function (err) {
        should.not.exist(err);
        should.exist(userClient._identity);

        async.series([
          function (next) {
            adminClient.getTenantInfo(userClient._identity.token.tenant.id, function (err, success) {
              should.not.exist(err);
              next();
            });
          },
          function (next) {
            userClient.getTenantInfo(userClient._identity.token.tenant.id, function (err, success) {
              should.exist(err);
              next();
            });
          }
        ], function (err) {
          should.not.exist(err);
          done();
        });
      });

    });

    it('with no active tenants listed from /v2.0/tenants should return an error', function (done) {

      if (mock) {
        server
          .post('/v2.0/tokens', {
            auth: {
              passwordCredentials: {
                username: 'MOCK-USERNAME',
                password: 'asdf1234'
              }
            }
          })
          .replyWithFile(200, __dirname + '/../../fixtures/openstack/initialToken.json')
          .get('/v2.0/tenants')
          .replyWithFile(200, __dirname + '/../../fixtures/openstack/no-activeTenants.json');
      }

      var client = identity.createClient({
        authUrl: 'http://localhost:12346',
        username: 'MOCK-USERNAME',
        password: 'asdf1234',
        region: 'Calxeda-AUS1'
      });

      client.auth(function (err) {
        should.exist(err);
        err.message.should.equal('Unable to find an active tenant');

        server && server.done();
        done();
      });
    });
  });

  after(function (done) {
    if (!mock) {
      return done();
    }

    async.parallel([
      function(next) {
        server.close(next);
      }, function(next) {
        adminServer.close(next);
      }], done);
  });

});
