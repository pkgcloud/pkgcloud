/*
* 
* (C) 2014 Alvaro M. Reol
*
*/


var Client = new require('../../../../lib/pkgcloud/core/base/client').Client;
var helpers = require('../../../helpers');

var should = require('should'),
    async = require('async'),
    hock = require('hock'),
    mock = !!process.env.MOCK;


var client = helpers.createClient('openstack', 'compute');

var options = {};

  describe('pkgcloud/common/compute/server[openstack]', function () {

    var authServer, server;

    before(function (done) {

      if (!mock) {
        return done();
      }

      async.parallel([
        function (next) {
          hock.createHock({
            port: 12345,
            throwOnUnmatched: false
          }, function (err, hockClient) {
            server = hockClient;
            next();
          });
        },
        function (next) {
          hock.createHock(12346, function (err, hockClient) {
            authServer = hockClient;
            next();
          });
        }
      ], done)
    });

    it('the server.startServer() method should start a server instance', function (done) {
      if (mock) {
		authServer
		  .post('/v2.0/tokens', {
			auth: {
			  passwordCredentials: {
				username: 'MOCK-USERNAME',
				password: 'MOCK-PASSWORD'
			  }
			}
		  })
		  .replyWithFile(200, __dirname + '/../../../fixtures/openstack/initialToken.json')
		  .get('/v2.0/tenants')
		  .replyWithFile(200, __dirname + '/../../../fixtures/openstack/tenantId.json')
		  .post('/v2.0/tokens', {
			auth: {
			  passwordCredentials: {
				username: 'MOCK-USERNAME',
				password: 'MOCK-PASSWORD'
			  },
			  tenantId: '72e90ecb69c44d0296072ea39e537041'
			}
		  })
		  .reply(200, helpers.getOpenstackAuthResponse());

		server
		  .post('/v2/72e90ecb69c44d0296072ea39e537041/servers/a2e90ecb69c44d0296072ea39e53704a/action', {"os-start":null})
		  .reply(202, '');
	  }

      client.startServer('a2e90ecb69c44d0296072ea39e53704a', function (err) {
        should.not.exist(err);

        authServer && authServer.done();
        server && server.done();

        done();
      });
	  

	});

    after(function (done) {
      if (!mock) {
        return done();
      }

      async.parallel([
        function (next) {
          authServer.close(next);
        },
        function (next) {
          server.close(next);
        }
      ], done)
    });

  });





