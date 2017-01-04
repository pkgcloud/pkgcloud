//TODO: Make this a vows test

var mockRequests = require('../../mock-requests');
var helpers = require('../../../helpers');
var should = require('should');
var mock = !!process.env.MOCK;

client = helpers.createClient('azure-v2', 'compute');

describe('pkgcloud/azure-v2/servers', function () {

  it('Get a single server with RUNNING state', function(done) {

    mockRequests.prepare();
    client.getServers((err, servers) => {
      should.not.exist(err);
      should(servers).be.instanceOf(Array).and.have.lengthOf(1);
      done();
    });

  });

  it('Get a single server with RUNNING state 2', function(done) {

    mockRequests.prepare();
    client.getServer('azure-vm-server', (err, server) => {
      should.not.exist(err);
      should.exist(server)
      server.status.should.equal('RUNNING');
      done();
    });

  });

});






