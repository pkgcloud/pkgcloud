var should = require('should'),
    pkgcloud = require('../../../lib/pkgcloud');

describe('pkgcloud/pkgcloud', function() {
  it('should throw an Error', function() {
    (function () {
        pkgcloud.storage.createClient({"provider":"in-memory"});
    }).should.throw(new Error("in-memory is not a supported provider"));
  });
});
