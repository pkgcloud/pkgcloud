/*
*
* (C) 2015 Matt Summers
*
*/

var helpers = require('../../../helpers');

var should = require('should'),
    async = require('async'),
    hock = require('hock'),
    http = require('http'),
    Server = require('../../../../lib/pkgcloud/core/compute/server').Server,
    mock = !!process.env.MOCK;

var client = helpers.createClient('openstack', 'compute');

describe('pkgcloud/openstack/compute', function () {

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

  it('the createServer() method should allow an availability zone parameter', function (done) {
    var m = mock ? .1 : 10;

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
        .post('/v2/72e90ecb69c44d0296072ea39e537041/servers', {
          server: {
            name: 'create-test-availability-zone',
            flavorRef: '1',
            imageRef: '506d077e-66bf-44ff-907a-588c5c79fa66',
            availability_zone: 'az1'
          }
        })
      .replyWithFile(202, __dirname + '/../../../fixtures/openstack/creatingServer.json')
      .get('/v2/72e90ecb69c44d0296072ea39e537041/servers/5a023de8-957b-4822-ad84-8c7a9ef83c07')
      .replyWithFile(200, __dirname + '/../../../fixtures/openstack/serverCreated3.json');
    }

    client.createServer({
      name: 'create-test-availability-zone',
      image: '506d077e-66bf-44ff-907a-588c5c79fa66',
      flavor: '1',
      availabilityZone: 'az1'
    }, function (err, srv1) {
      should.not.exist(err);
      should.exist(srv1);

      srv1.setWait({ status: srv1.STATUS.running }, 100 * m, function (err, srv2) {
        should.not.exist(err);
        should.exist(srv2);
        srv2.should.be.instanceOf(Server);
        srv2.name.should.equal('create-test-availability-zone');
        srv2['OS-EXT-AZ:availability_zone'].should.equal('az1');

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });
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
