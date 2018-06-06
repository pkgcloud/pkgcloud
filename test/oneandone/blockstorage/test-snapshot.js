/**
 * Created by Ali Bazlamit on 8/30/2017.
 */
var server,
    _snapshot,
    blockStorage,
    client;
var should = require('should'),
    helpers = require('../../helpers'),
    hock = require('hock'),
    http = require('http'),
    mock = !!process.env.MOCK,
    Snapshot = require('../../../lib/pkgcloud/oneandone/blockstorage/snapshot').Snapshot;

var srvr_options = {
  name: 'create-test-ids2',
  flavor: '8C626C1A7005D0D1F527143C413D461E',
  image: 'A0FAA4587A7CB6BBAA1EA877C844977E',
  location: '4EFAD5836CE43ACA502FD5B99BEE44EF',
  token: process.env.OAO_TOKEN
};

describe('pkgcloud/oneandone/blockstorage/snapshots', function () {
  this.timeout(18000000);
  var hockInstance, mockServer;

  before(function (done) {
    client = helpers.createClient('oneandone', 'compute');
    blockStorage = helpers.createClient('oneandone', 'blockstorage');

    if (!mock) {
      return done();
    }
    hockInstance = hock.createHock({ throwOnUnmatched: false });
    mockServer = http.createServer(hockInstance.handler);
    mockServer.listen(12345, done);
  });

  after(function (done) {
    if (!mock) {
      return done();
    }
    mockServer.close(function () {
      done();
    });
  });

  describe('Snapshot tests', function () {

    before(function (done) {

      hockInstance
          .post('/servers', {
            name: 'create-test-ids2',
            hardware: { fixed_instance_size_id: '8C626C1A7005D0D1F527143C413D461E' },
            appliance_id: 'A0FAA4587A7CB6BBAA1EA877C844977E',
            datacenter_id: '4EFAD5836CE43ACA502FD5B99BEE44EF',
            server_type: 'cloud'
          })
          .reply(202, helpers.loadFixture('oneandone/getServer.json'))
          .get('/servers/39AA65F5D5B02FA02D58173094EBAF95')
          .reply(202, helpers.loadFixture('oneandone/getServer.json'))
          .post('/servers/39AA65F5D5B02FA02D58173094EBAF95/snapshots','null')
          .reply(202, helpers.loadFixture('oneandone/getServer.json'));

      client.createServer(srvr_options, function (err, srv1) {
        should.not.exist(err);
        should.exist(srv1);
        server = srv1;
        server.setWait({ status: server.STATUS.running }, 5000, function (err) {
          if (err) {
            console.dir(err);
            return;
          }
          blockStorage.createSnapshot(server, function (err, snapshot) {
            should.not.exist(err);
            _snapshot = snapshot;
            hockInstance && hockInstance.done();
            done();
          });
        });
      });

    });

    it('the getSnapshots() method should return a list of snapshots', function (done) {
      if (mock) {
        hockInstance
            .get('/servers/39AA65F5D5B02FA02D58173094EBAF95/snapshots')
            .reply(200, helpers.loadFixture('oneandone/snapshots.json'))
            .get('/servers/39AA65F5D5B02FA02D58173094EBAF95')
            .reply(202, helpers.loadFixture('oneandone/getServer.json'));
      }
      server.setWait({ status: server.STATUS.running }, 5000, function (err) {
        if (err) {
          console.dir(err);
          return;
        }
        blockStorage.getSnapshots(server, function (err, snapshots) {
          should.not.exist(err);
          should.exist(snapshots);

          snapshots.should.be.an.Array;

          snapshots.forEach(function (snp) {
            snp.should.be.instanceOf(Snapshot);
          });
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    it('the updateSnapshot() method should restore a snapshot into a server', function (done) {
      if (mock) {
        hockInstance
            .put('/servers/39AA65F5D5B02FA02D58173094EBAF95/snapshots/','null')
            .reply(202, helpers.loadFixture('oneandone/createSnapshot.json'))
            .get('/servers/39AA65F5D5B02FA02D58173094EBAF95')
            .reply(202, helpers.loadFixture('oneandone/getServer.json'));
      }
      var updateops = {};
      updateops.server = server;
      updateops.snapshot = _snapshot;
      server.setWait({ status: server.STATUS.running }, 5000, function (err) {
        if (err) {
          console.dir(err);
          return;
        }
        blockStorage.updateSnapshot(updateops, function (err, response) {
          should.not.exist(err);
          should.exist(response);
          response.should.be.instanceOf(Snapshot);
          hockInstance && hockInstance.done();
          done();
        });
      });
    });

    after(function (done) {

      if (mock) {
        hockInstance
            .get('/servers/39AA65F5D5B02FA02D58173094EBAF95')
            .reply(202, helpers.loadFixture('oneandone/getServer.json'))
            .get('/servers/39AA65F5D5B02FA02D58173094EBAF95')
            .reply(202, helpers.loadFixture('oneandone/getServer.json'))
            .delete('/servers/39AA65F5D5B02FA02D58173094EBAF95/snapshots/')
            .reply(202, helpers.loadFixture('oneandone/getServer.json'))
            .delete('/servers/39AA65F5D5B02FA02D58173094EBAF95?keep_ips=false')
            .reply(202, helpers.loadFixture('oneandone/getServer.json'));
      }

      var deleteOps = {};
      deleteOps.server = server;
      deleteOps.snapshot = _snapshot;
      server.setWait({ status: server.STATUS.running }, 5000, function (err) {
        if (err) {
          console.dir(err);
          return;
        }
        blockStorage.deleteSnapshot(deleteOps, function (err, response) {
          should.not.exist(err);
          should.exist(response);
          server.setWait({ status: server.STATUS.running }, 5000, function (err) {
            if (err) {
              console.dir(err);
              return;
            }
            client.destroyServer(server, function (err, response) {
              should.not.exist(err);
              should.exist(response);
              done();
            });
          });
        });
      });
    });
  });
});

