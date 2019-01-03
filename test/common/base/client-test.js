  /*
* client-test.js: Tests for pkgcloud base client
*
* (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
*
*/

var should = require('should'),
    pkgcloud = require('../../../lib/pkgcloud'),
    Client = new require('../../../lib/pkgcloud/core/base/client').Client;

describe('pkgcloud/core/base/client', function () {
  describe('The pkgcloud base client request method', function() {
    it('with a wrong request with a cb', function(done) {
      var cli = new Client();
      cli._getUrl = function () {
        return 'badurl';
      };
      cli.failCodes = {};
      cli._request({ path: '/' }, function(err) {
        should.exist(err);
        done();
      });
    });

    it('with a wrong request without a cb', function (done) {
      var cli = new Client();

      cli._getUrl = function () {
        return 'badurl';
      };
      cli.failCodes = {};
      var stream = cli._request({ path: '/' });

      function handleResponse(err) {
        should.exist(err);
        done();
      }

      stream.on('error', function () {
        return handleResponse(true);
      });
      stream.on('end', function () {
        return handleResponse(false);
      });
    });

    it('the before filters throwing an error with a callback should return the error on the cb', function(done) {
      var cli = new Client();
      cli._getUrl = function () {
        return 'badurl';
      };
      cli.failCodes = {};
      cli.before = [function () {
        throw new Error('Foo!');
      }];
      cli._request({ path: '/' }, function(err) {
        should.exist(err);
        done();
      });
    });

    it('custom user agents should work', function () {
      var cli = new Client();
      cli.setCustomUserAgent('my-app/1.2.3');
      cli.getUserAgent().should.equal('my-app/1.2.3 nodejs-pkgcloud/' + pkgcloud.version);
    });

    it('the before filters throwing an error without a callback should return the error on the EE', function(done) {
      var cli = new Client();

      cli._getUrl = function () {
        return 'badurl';
      };
      
      function handleResponse(err) {
        should.exist(err);
        done();
      }

      cli.failCodes = {};
      var stream = cli._request({ path: '/' });
      stream.on('error', function () {
        handleResponse(true);
      });
      stream.on('end', function () {
        handleResponse(false);
      });
    });
  });
});
