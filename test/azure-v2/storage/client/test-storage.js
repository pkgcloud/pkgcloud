//TODO: Make this a vows test

var mockRequests = require('../../mock-requests');
var helpers = require('../../../helpers');
var should = require('should');

var client = helpers.createClient('azure-v2', 'storage');

describe('pkgcloud/azure-v2/storage', function () {

  it('Create container', function(done) {

    mockRequests.prepare();
    client.createContainer('azurestorage', function (err, container) {
      should.not.exist(err);
      should.exist(container);
      should(container.name).be.exactly('azurestorage');
      done();
    });
  });

  it('Get container', function(done) {

    mockRequests.prepare();
    client.getContainer('azurestorage', function (err, container) {
      should.not.exist(err);
      should.exist(container);
      should(container.name).be.exactly('azurestorage');
      done();
    });
  });

  // Todo:
  // Find out if can test download file
  // it('Get files in container', function(done) {

  //   mockRequests.prepare();
  //   client.getFiles('azurestorage', { container: 'container' }, function (err, files) {
  //     should.not.exist(err);
  //     should.exist(container);
  //     should(container.name).be.exactly('azurestorage');
  //     done();
  //   });
  // });

});






