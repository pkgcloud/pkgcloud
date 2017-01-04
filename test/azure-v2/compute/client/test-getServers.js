//TODO: Make this a vows test

var mockRequests = require('../../mock-requests');
var helpers = require('../../../helpers');
var should = require('should');
var mock = !!process.env.MOCK;

// client.getServer('azure-vm-server', function (err, result) {
//   if (err) {
//     console.error(err);
//   } else {
//     console.dir(result);
//   }
// });

// client.getServers(function (err, result) {
//   if (err) {
//     console.error(err);
//   } else {
//     console.dir(result);
//   }
// });

describe('pkgcloud/amazon/groups', function () {

  var client;

  before(function (done) {
    debugger;
    client = helpers.createClient('azure-v2', 'compute');

    if (!mock) {
      return done();
    }

    mockRequests.prepare();
  });

  it('add SecurityGroup should succeed', function(done) {

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






