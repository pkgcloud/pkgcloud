//TODO: Make this a vows test

var mockRequests = require('../../mock-requests');
var helpers = require('../../../helpers');
var should = require('should');
var mock = !!process.env.MOCK;

describe('pkgcloud/azure-v2/servers', function () {

  var client;

  before(function (done) {
    debugger;
    client = helpers.createClient('azure-v2', 'compute');

    if (!mock) {
      return done();
    }

    mockRequests.prepare();
  });

  it('Get a single server with RUNNING state', function(done) {

    debugger;
    client.getServer('azure-vm-server', (err, server) => {
      should.not.exist(err);
      should.exist(server)
      server.status.should.equal('RUNNING');
    });

  });

  after(function(done) {
    if (!mock) {
      return done();
    }

    //server.close(done);
  });
});






