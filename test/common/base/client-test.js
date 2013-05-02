/*
* client-test.js: Tests for pkgcloud base client
*
* (C) 2012 Nodejitsu Inc.
*
*/

var should = require('should'),
    Client = new require('../../../lib/pkgcloud/core/base/client').Client;

describe('pkgcloud/core/base/client', function () {
  describe('The pkgcloud base client request method', function() {
    it('with a wrong request with a cb', function(done) {
      var cli = new Client();
      cli.getUrl = function () {
        return "badurl";
      };
      cli.failCodes = {};
      cli.request({ path: '/' }, function(err) {
        should.exist(err);
        done();
      });
    });

    it('with a wrong request without a cb', function (done) {
      var cli = new Client();

      cli.getUrl = function () {
        return "badurl";
      };
      cli.failCodes = {};
      var stream = cli.request({ path: '/' });
      stream.on('error', function () {
        return handleResponse(true);
      });
      stream.on('end', function () {
        return handleResponse(false);
      });

      function handleResponse(err) {
        should.exist(err);
        done();
      }

    });

    it('the before filters throwing an error with a callback should return the error on the cb', function(done) {
      var cli = new Client();
      cli.getUrl = function () {
        return "badurl";
      };
      cli.failCodes = {};
      cli.before = [function () {
        throw new Error('Foo!');
      }];
      cli.request({ path: '/' }, function(err) {
        should.exist(err);
        done();
      });
    });

    it('the before filters throwing an error without a callback should return the error on the EE', function(done) {
      var cli = new Client();

      cli.getUrl = function () {
        return "badurl";
      };
      cli.failCodes = {};
      var stream = cli.request({ path: '/' });
      stream.on('error', function () {
        handleResponse(true);
      });
      stream.on('end', function () {
        handleResponse(false);
      });

      function handleResponse(err) {
        should.exist(err);
        done();
      }
    });
  });
});
