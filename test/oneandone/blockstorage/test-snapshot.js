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
  Server = require('../../../lib/pkgcloud/core/compute/server').Server,
  Snapshot = require('../../../lib/pkgcloud/oneandone/blockstorage/snapshot').Snapshot;

var srvr_options = {
  name: 'create-test-oao',
  flavor: '81504C620D98BCEBAA5202D145203B4B',
  image: '6631A1589A2CC87FEA9B99AB07399281',
  location: '4EFAD5836CE43ACA502FD5B99BEE44EF',
  token: process.env.OAO_TOKEN
};

describe('Snapshot tests', function () {
  this.timeout(18000000);
  var hockInstance, mockServer;

  before(function (done) {
    client = helpers.createClient('oneandone', 'compute', srvr_options);
    blockStorage = helpers.createClient('oneandone', 'blockstorage', srvr_options);
    if (!mock) {

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
            should.exist(snapshot);
            _snapshot = snapshot;
            hockInstance && hockInstance.done();
            done();
          });
        });
      });
    } else {
      hockInstance = hock.createHock({ throwOnUnmatched: false });
      hockInstance.filteringRequestBody(helpers.authFilter);
      mockServer = http.createServer(hockInstance.handler);
      mockServer.listen(12345, done);
    }
  });

  after(function (done) {
    if (hockInstance) {
      mockServer.close(function () {
        done();
      });
    }
    else {
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
          server.setWait({ status: server.STATUS.running }, 15000, function (err) {
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
    }
  });

  it('the getSnapshots() method should return a list of snapshots', function (done) {
    if (mock) {
      hockInstance
        .get('servers/{server_id}/snapshots')
        .reply(200, helpers.loadFixture('oneandone/snapshots.json'));
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
        .get('/servers/92AA60BEC8333A21EDB9EAAA61852860/snapshots/D609F69D08EB0C77D8EADE22F70462B4')
        .reply(202, helpers.loadFixture('oneandone/createSnapshot.json'));
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
});

