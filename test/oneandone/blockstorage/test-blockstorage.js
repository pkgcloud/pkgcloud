var server, volume;
var should = require('should'),
  helpers = require('../../helpers'),
  hock = require('hock'),
  http = require('http'),
  mock = !!process.env.MOCK,
  Volume = require('../../../lib/pkgcloud/oneandone/blockstorage/volume').Volume,
  Server = require('../../../lib/pkgcloud/core/compute/server').Server;

var client, bsclient;
var bsName = 'test-bs4';
var options = {
  name: 'create-BS-oao4',
  flavor: '',
  image: '',
  location: '908DC2072407C94C8054610AD5A53B8C',
  token: process.env.OAO_TOKEN
};

describe('block storage tests', function () {
  this.timeout(18000000);
  var hockInstance, mockServer;
  before(function (done) {
    client = helpers.createClient('oneandone', 'compute');
    bsclient = helpers.createClient('oneandone', 'blockstorage');
    if (!mock) {
      client.getFlavors(function (err, flavors) {
        for (var i = 0; i < flavors.length; i++) {
          if (flavors[i].name == 'L') {
            options.flavor = flavors[i].id;
            break;
          }
        }
        should.not.exist(err);
        client.getImages(function (err, images) {
          should.not.exist(err);
          for (var i = 0; i < images.length; i++) {
            if (images[i].os_version.includes('Ubuntu14') && images[i].type == 'IMAGE') {
              options.image = images[i].id;
              break;
            }
          }
          client.createServer(options, function (err, srv1) {
            should.not.exist(err);
            should.exist(srv1);
            server = srv1;
            srv1.should.be.instanceOf(Server);
            srv1.name.should.equal(options.name);
            srv1.image.id.should.equal(options.image);
            hockInstance && hockInstance.done();
            client.checkServerReady(srv1.id, function () {
              var details = {
                name: bsName,
                size: 20,
                datacenter_id: options.location,
                server: srv1.id
              };

              bsclient.createVolume(details, function (err, bs1) {
                should.not.exist(err);
                should.exist(bs1);
                bs1.should.be.instanceOf(Volume);
                volume = bs1;
                done();
              });
            });
          });
        });
      });
    } else {
      hockInstance = hock.createHock({throwOnUnmatched: false});
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
    } else {
      client.checkServerReady(server.id, function () {
        bsclient.waitVolumeReady(volume.id, function () {
          client.destroyServer(server, function (err, response) {
            should.not.exist(err);
            should.exist(response);
            done();
          });
        });

      });
    }
  });

  it('the getvolumes() method should return a list of volumes', function (done) {
    if (mock) {
      hockInstance
        .get('/shared_storages')
        .reply(200, helpers.loadFixture('oneandone/listBlockStorages.json'));
    }
    bsclient.getVolumes(function (err, volumes) {
      should.not.exist(err);
      should.exist(volumes);
      volumes.should.be.an.Array;
      volumes.forEach(function (vol) {
        vol.should.be.instanceOf(Volume);
      });
      hockInstance && hockInstance.done();
      done();
    });
  });

  it('the getVolume() method should return a volume information', function (done) {
    if (mock) {
      hockInstance
        .get('/shared_storages/4406CE4723BB441C7956E25C51CE8C1B')
        .reply(200, helpers.loadFixture('oneandone/getBlockStorage.json'));
    }
    bsclient.getVolume(volume, function (err, bs1) {
      should.not.exist(err);
      should.exist(bs1);
      bs1.should.be.instanceOf(Volume);
      hockInstance && hockInstance.done();
      done();
    });
  });
});