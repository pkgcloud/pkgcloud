//TODO: Make this a vows test

var mockRequests = require('../../mock-requests');
var helpers = require('../../../helpers');
var should = require('should');
var mock = !!process.env.MOCK;

var createParams = {
  name:  'azure-vm-server',
  flavor: 'DEFAULT',
  username:  'username',
  password:  'password',

  imagePublisher: "Canonical",
  imageOffer: "UbuntuServer",
  imageSku: "16.04.0-LTS",
  imageVersion: "latest"
};
var client = helpers.createClient('azure-v2', 'compute');

describe('pkgcloud/azure-v2/servers', function () {

  it('Get multiple servers', function(done) {

    mockRequests.prepare();
    client.getServers((err, servers) => {
      should.not.exist(err);
      should(servers).be.instanceOf(Array).and.have.lengthOf(1);
      done();
    });

  });

  it('Get a single server with RUNNING state', function(done) {

    mockRequests.prepare();
    client.getServer('azure-vm-server', (err, server) => {
      should.not.exist(err);
      should.exist(server)
      server.status.should.equal('RUNNING');
      done();
    });

  });

  
  it('Creating a new server', function(done) {

    mockRequests.prepare();
    client.createServer(createParams, (err, server) => {
      should.not.exist(err);
      should.exist(server);
      server.status.should.equal('RUNNING');
      done();
    });

  });

  it('Deleting a VM with dependencies', function (done) {
    mockRequests.prepare();
    client.destroyServer(createParams, { destroyDependencies: true, destroyStorage: true }, (err, serverId) => {
      should.not.exist(err);
      done();
    });
  })

});






