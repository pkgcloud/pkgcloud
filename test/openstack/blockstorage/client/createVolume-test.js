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
    Volume = require('../../../../lib/pkgcloud/openstack/blockstorage/volume').Volume,
    mock = !!process.env.MOCK;

var client = helpers.createClient('openstack', 'blockstorage');

describe('pkgcloud/openstack/blockstorage', function () {

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

  it('the createVolume() method should allow an availability zone parameter', function (done) {
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
        .post('/v1/72e90ecb69c44d0296072ea39e537041/volumes', {
          volume: {
            'display_name': 'create-test-availability-zone',
            'display_description': 'description',
            size: 30,
            availability_zone: 'az1'
          }
        })
      .replyWithFile(202, __dirname + '/../../../fixtures/openstack/creatingVolume.json')
      .get('/v1/72e90ecb69c44d0296072ea39e537041/volumes/93c2e2aa-7744-4fd6-a31a-80c4726b08d7')
      .replyWithFile(200, __dirname + '/../../../fixtures/openstack/volumeCreated.json');
    }

    client.createVolume({
      name: 'create-test-availability-zone',
      description: 'description',
      availabilityZone: 'az1',
      size: 30
    }, function (err, vol1) {
      if (err) {
        console.log(err);
        console.log(err.message);
        console.log(err.result);
      }
      should.not.exist(err);
      should.exist(vol1);
      should.exist(vol1.id);
      vol1.should.be.instanceOf(Volume);

      client.getVolume(vol1.id, function (err, vol2) {
        should.not.exist(err);
        should.exist(vol2);
        vol2.should.be.instanceOf(Volume);
        vol2.name.should.equal('create-test-availability-zone');
        vol2.availabilityZone.should.equal('az1');

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
