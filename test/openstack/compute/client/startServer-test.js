/*
* 
* (C) 2014 Alvaro M. Reol
*
*/

var helpers = require('../../../helpers');

var should = require('should'),
    async = require('async'),
    hock = require('hock'),
    http = require('http'),
    mock = !!process.env.MOCK;

var client = helpers.createClient('openstack', 'compute');

  describe('pkgcloud/common/compute/server[openstack]', function () {

    var authHockInstance, hockInstance, authServer, server;

    before(function (done) {

      if (!mock) {
        return done();
      }

      hockInstance = hock.createHock({ throwOnUnmatched: false });
      authHockInstance = hock.createHock();

      server = http.createServer(hockInstance.handler);
      authServer = http.createServer(authHockInstance.handler);

      async.parallel([
        function (next) {
          server.listen(12345, next);
        },
        function (next) {
          authServer.listen(12346, next);
        }
      ], done);
    });

    it('the server.startServer() method should start a server instance', function (done) {
      if (mock) {
		authHockInstance
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

		hockInstance
		  .post('/v2/72e90ecb69c44d0296072ea39e537041/servers/a2e90ecb69c44d0296072ea39e53704a/action',
        { 'os-start': null })
		  .reply(202, '');
	  }

      client.startServer('a2e90ecb69c44d0296072ea39e53704a', function (err) {
        should.not.exist(err);

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();

        done();
      });
	  

	});

    after(function (done) {
      if (!mock) {
        return done();
      }

      async.parallel([
        function (next) {
          server.close(next);
        },
        function (next) {
          authServer.close(next);
        }
      ], done);
    });

  });





