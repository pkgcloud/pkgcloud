//TODO: Make this a vows test

var mockRequests = require('../../mock-requests');
var helpers = require('../../../helpers');
var should = require('should');
var mock = !!process.env.MOCK;

describe('pkgcloud/azure-v2/servers', function () {
  this.timeout(200000);
  var client;

  before(function (done) {
    client = helpers.createClient('azure-v2', 'compute');

    if (!mock) {
      return done();
    }

    mockRequests.prepare();
    done();
  });

  it('Get a single server with RUNNING state', function(done) {

    debugger;
    client.getServer('azure-vm-server', (err, server) => {
      should.not.exist(err);
      should.exist(server)
      server.status.should.equal('RUNNING');
      done();
    });

  });

  it('Get a single server with RUNNING state 2', function(done) {

    debugger;
    client.getServer('azure-vm-server', (err, server) => {
      should.not.exist(err);
      should.exist(server)
      server.status.should.equal('RUNNING');
      done();
    });

  });

  after(function(done) {
    if (!mock) {
      return done();
    }

    //server.close(done);
  });
});






