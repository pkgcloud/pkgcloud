/*
 * base-test.js: Test that should be common to all providers.
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */

var helpers = require('../../helpers'),
  should = require('should'),
  util = require('util'),
  async = require('async'),
  hock = require('hock'),
  http = require('http'),
  urlJoin = require('url-join'),
  providers = require('../../configs/providers.json'),
  mock = !!process.env.MOCK,
  pkgcloud = require('../../../lib/pkgcloud');

// Declaring variables for helper functions defined later
var setupUploadStreamError;

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].storage;
}).forEach(function (provider) {
  describe('pkgcloud/common/storage/base [' + provider + ']', function () {

    var client = helpers.createClient(provider, 'storage'),
      authServer, server,
      authHockInstance, hockInstance;

    before(function (done) {

      if (!mock) {
        return done();
      }

      hockInstance = hock.createHock({ throwOnUnmatched: false });
      authHockInstance = hock.createHock();

      server = http.createServer(hockInstance.handler);
      authServer = http.createServer(authHockInstance.handler);

      // setup a filtering path for aws
      hockInstance.filteringPathRegEx(/https:\/\/[\w\-\.]*s3-us-west-2\.amazonaws\.com([\w\-\.\_0-9\/]*)/g, '$1');

      async.parallel([
        function (next) {
          server.listen(12345, next);
        },
        function (next) {
          authServer.listen(12346, next);
        }
      ], done);
    });

    it('the client.upload stream should emit error', function (done) {
      if (mock) {
        setupUploadStreamError(provider, client, {
          server: hockInstance,
          authServer: authHockInstance
        });
      }

      var stream = client.upload({
        container: 'pkgcloud-test-container',
        remote: 'test-file.txt'
      });

      stream.on('error', function (err) {
        should.exist(err);
        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();
      });

      stream.on('success', function (file) {
        should.not.exist(file);
        done();
      });

      stream.end('foo');
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
});

setupUploadStreamError = function (provider, client, servers) {
  if (provider === 'rackspace') {
    servers.authServer
      .post('/v2.0/tokens', {
        auth: {
          'RAX-KSKEY:apiKeyCredentials': {
            username: 'MOCK-USERNAME',
            apiKey: 'MOCK-API-KEY'
          }
        }
      })
      .reply(200, helpers.getRackspaceAuthResponse());

    servers.server
      .put('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt', 'foo')
      .reply(400);
  }
  else if (provider === 'openstack') {
    servers.authServer
      .post('/v2.0/tokens', {
        auth: {
          passwordCredentials: {
            username: 'MOCK-USERNAME',
            password: 'MOCK-PASSWORD'
          }
        }
      }, {'User-Agent': util.format('nodejs-pkgcloud/%s', pkgcloud.version)})
      .reply(200, helpers._getOpenstackStandardResponse('../fixtures/openstack/initialToken.json'))
      .get('/v2.0/tenants', {'User-Agent': util.format('nodejs-pkgcloud/%s', pkgcloud.version)})
      .replyWithFile(200, __dirname + '/../../fixtures/openstack/tenantId.json')
      .post('/v2.0/tokens', {
        auth: {
          passwordCredentials: {
            username: 'MOCK-USERNAME',
            password: 'MOCK-PASSWORD'
          },
          tenantId: '72e90ecb69c44d0296072ea39e537041'
        }
      }, {'User-Agent': util.format('nodejs-pkgcloud/%s', pkgcloud.version)})
      .reply(200, helpers.getOpenstackAuthResponse());

    servers.server
      .put('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt', 'foo')
      .reply(400);
  }
  else if (provider === 'amazon') {
    servers.server
      .put('/test-file.txt', 'foo')
      .reply(400);
  }
  else if (provider === 'azure') {

    // Override the clients getUrl method as it tries to prefix the container name onto the request
    client._getUrl = function (options) {
      options = options || {};

      return urlJoin('http://localhost:12345/',
        (typeof options === 'string'
          ? options
          : options.path));
    };

    servers.server
      .put('/pkgcloud-test-container/test-file.txt?comp=block&blockid=block000000000000000', 'foo')
      .reply(400);
  }
  else if (provider === 'hp') {
    servers.authServer
      .post('/v2.0/tokens', {
        auth: {
          apiAccessKeyCredentials: {
            accessKey: 'MOCK-USERNAME',
            secretKey: 'MOCK-API-KEY'
          }
        }
      }, {'User-Agent': util.format('nodejs-pkgcloud/%s', pkgcloud.version)})
      .reply(200, helpers._getOpenstackStandardResponse('../fixtures/hp/initialToken.json'))
      .get('/v2.0/tenants', {'User-Agent': util.format('nodejs-pkgcloud/%s', pkgcloud.version)})
      .replyWithFile(200, __dirname + '/../../fixtures/hp/tenantId.json')
      .post('/v2.0/tokens', {
        auth: {
          apiAccessKeyCredentials: {
            accessKey: 'MOCK-USERNAME',
            secretKey: 'MOCK-API-KEY'
          },
          tenantId: '5ACED3DC3AA740ABAA41711243CC6949'
        }
      }, {'User-Agent': util.format('nodejs-pkgcloud/%s', pkgcloud.version)})
      .reply(200, helpers.gethpAuthResponse());

    servers.server
      .put('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt', 'foo')
      .reply(400);
  }
};
