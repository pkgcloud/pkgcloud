var identity = require('../../../lib/pkgcloud/openstack/identity'),
    should = require('should'),
    hock = require('hock'),
    mock = !!process.env.NOCK;

describe('pkgcloud/openstack/identity', function () {
  var server;

  before(function (done) {

    if (!mock) {
      return done();
    }

    hock.createHock(12346, function (err, hockClient) {
      should.not.exist(err);
      should.exist(hockClient);

      server = hockClient;
      done();
    });
  });

  describe('the pkgcloud openstack identity.createIdentity() function', function() {
    it('with no options should throw an error', function () {
      (function() {
        identity.createIdentity();
      }).should.throw('options is a required argument');
    });

    it('with only a callback should throw', function () {
      (function () {
        identity.createIdentity(function(err) { });
      }).should.throw('options is a required argument');
    });

    it('with incorrect types should throw', function () {
      (function () {
        identity.createIdentity(true, true);
      }).should.throw('options is a required argument');
    });

    it('with options.identity of an invalid type', function () {
      (function () {
        identity.createIdentity({ identity: true }, function(err) {});
      }).should.throw('options.identity must be an Identity if provided');
    });

    it('without a proper callback should throw', function () {
      (function () {
        identity.createIdentity({ identity: true }, true);
      }).should.throw('callback is a required argument');
    });

    it('with missing url should throw', function () {
      (function () {
        identity.createIdentity({}, function(err) {});
      }).should.throw('options.url is a required option');
    });

    it('with missing username/password should return an error', function (done) {
      identity.createIdentity({
        url: 'http://my.authendpoint.com'
      }, function (err) {
        should.exist(err);
        err.message.should.equal('Unable to authorize; missing required inputs');
        done();
      });
    });

    it('with missing password should return an error', function (done) {
      identity.createIdentity({
        url: 'http://my.authendpoint.com',
        username: 'MOCK-USERNAME'
      }, function (err) {
        should.exist(err);
        err.message.should.equal('Unable to authorize; missing required inputs');
        done();
      });
    });

    it('with missing username should return an error', function (done) {
      identity.createIdentity({
        url: 'http://my.authendpoint.com',
        password: 'MOCK-USERNAME'
      }, function (err) {
        should.exist(err);
        err.message.should.equal('Unable to authorize; missing required inputs');
        done();
      });
    });

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
          .replyWithFile(200, __dirname + '/../../fixtures/openstack/realToken.json');
      }

      identity.createIdentity({
        url: 'http://localhost:12346',
        username: 'MOCK-USERNAME',
        password: 'asdf1234',
        region: 'Calxeda-AUS1'
      }, function(err, id) {
        should.not.exist(err);
        should.exist(id);
        id.should.be.instanceOf(identity.Identity);

        server && server.done();
        done();
      });
    });

    it('with valid inputs but incorrect region should return an error', function (done) {

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
          .replyWithFile(200, __dirname + '/../../fixtures/openstack/realToken.json');
      }

      identity.createIdentity({
        url: 'http://localhost:12346',
        username: 'MOCK-USERNAME',
        password: 'asdf1234',
        region: 'foo'
      }, function (err, id) {
        should.not.exist(id);
        should.exist(err);
        err.message.should.equal('Unable to identify target endpoint for Service: volume');

        server && server.done();
        done();
      });
    });

    it('with no region and regionless service catalog should return an identity', function (done) {

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
          .replyWithFile(200, __dirname + '/../../fixtures/openstack/realToken-noRegion.json');
      }

      identity.createIdentity({
        url: 'http://localhost:12346',
        username: 'MOCK-USERNAME',
        password: 'asdf1234'
      }, function (err, id) {
        should.not.exist(err);
        should.exist(id);
        id.should.be.instanceOf(identity.Identity);

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

      identity.createIdentity({
        url: 'http://localhost:12346',
        username: 'MOCK-USERNAME',
        password: 'asdf1234'
      }, function (err, id) {
        should.exist(err);
        should.not.exist(id);
        err.message.should.equal('Unable to find tenants');

        server && server.done();
        done();
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

      identity.createIdentity({
        url: 'http://localhost:12346',
        username: 'MOCK-USERNAME',
        password: 'asdf1234'
      }, function (err, id) {
        should.exist(err);
        should.not.exist(id);
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

    server.close(done);
  });

});
