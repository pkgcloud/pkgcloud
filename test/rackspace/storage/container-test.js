/*
* container-test.js: Tests for Rackspace Cloudfiles containers
*
* (C) 2010 Nodejitsu Inc.
* MIT LICENSE
*
*/

var path = require('path'),
    fs = require('fs'),
    should = require('should'),
    pkgcloud = require('../../../lib/pkgcloud'),
    helpers = require('../../helpers'),
    async = require('async'),
    hock = require('hock'),
    Container = require('../../../lib/pkgcloud/core/storage/container').Container,
    mock = !!process.env.MOCK;

if (!mock) {
  return; // these tests are disabled when running for real
}

describe('pkgcloud/rackspace/storage/containers', function () {
  describe('The pkgcloud Rackspace Storage client', function () {

    var client, server, authServer;

    before(function (done) {
      client = helpers.createClient('rackspace', 'storage');

      if (!mock) {
        return done();
      }

      async.parallel([
        function (next) {
          hock.createHock(12346, function (err, hockClient) {
            should.not.exist(err);
            should.exist(hockClient);

            authServer = hockClient;
            next();
          });
        },
        function (next) {
          hock.createHock(12345, function (err, hockClient) {
            should.not.exist(err);
            should.exist(hockClient);

            server = hockClient;
            next();
          });
        }
      ], done);
    });

    it('getContainers should return a list of containers', function (done) {

      if (mock) {
        authServer
          .post('/v2.0/tokens', {
            auth: {
              'RAX-KSKEY:apiKeyCredentials': {
                username: 'MOCK-USERNAME',
                apiKey: 'MOCK-API-KEY'
              }
            }
          })
          .reply(200, helpers.getRackspaceAuthResponse());

        server
          .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00?format=json')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/getContainers.json');
      }

      client.getContainers(function(err, containers) {
        should.not.exist(err);
        should.exist(containers);
        containers.should.have.length(5);
        containers.forEach(function(c) {
          c.should.be.instanceof(Container);
        });
        authServer && authServer.done();
        server && server.done();
        done();
      });
    });

    it('getContainers with options should get CDN attributes and return a list of containers', function (done) {

      if (mock) {
        server
          .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00?format=json')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/getContainers.json')
          .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.3-85')
          .reply(204, '', {
            'x-cdn-ssl-uri': 'https://c98c1215ec09a78cd287-edfcb31ae70ea7c07367728d50539bc7.ssl.cf1.rackcdn.com',
            'x-ttl': '186400',
            'x-cdn-enabled': 'False',
            'x-log-retention': 'True',
            'x-cdn-ios-uri': 'http://1762d02cb83dd4594008-edfcb31ae70ea7c07367728d50539bc7.iosr.cf1.rackcdn.com',
            'x-cdn-uri': 'http://cbebcab2b59eae3d0c71-edfcb31ae70ea7c07367728d50539bc7.r63.cf1.rackcdn.com',
            'content-type': 'text/html; charset=UTF-8',
            'x-cdn-streaming-uri': 'http://e5addf7be8783adf8c6d-edfcb31ae70ea7c07367728d50539bc7.r63.stream.cf1.rackcdn.com',
            'content-length': '0',
            'x-trans-id': 'tx8a8acb8f3f7142c8bd36f27a18415996',
            date: 'Wed, 12 Jun 2013 19:04:25 GMT',
            connection: 'keep-alive' })
          .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.3-85%2C')
          .reply(204, '', {
            'x-cdn-ssl-uri': 'https://c98c1215ec09a78cd287-edfcb31ae70ea7c07367728d50539bc7.ssl.cf1.rackcdn.com',
            'x-ttl': '186400',
            'x-cdn-enabled': 'False',
            'x-log-retention': 'True',
            'x-cdn-ios-uri': 'http://1762d02cb83dd4594008-edfcb31ae70ea7c07367728d50539bc7.iosr.cf1.rackcdn.com',
            'x-cdn-uri': 'http://cbebcab2b59eae3d0c71-edfcb31ae70ea7c07367728d50539bc7.r63.cf1.rackcdn.com',
            'content-type': 'text/html; charset=UTF-8',
            'x-cdn-streaming-uri': 'http://e5addf7be8783adf8c6d-edfcb31ae70ea7c07367728d50539bc7.r63.stream.cf1.rackcdn.com',
            'content-length': '0',
            'x-trans-id': 'tx8a8acb8f3f7142c8bd36f27a18415996',
            date: 'Wed, 12 Jun 2013 19:04:25 GMT',
            connection: 'keep-alive' })
          .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.3-87')
          .reply(204, '', {
            'x-cdn-ssl-uri': 'https://c98c1215ec09a78cd287-edfcb31ae70ea7c07367728d50539bc7.ssl.cf1.rackcdn.com',
            'x-ttl': '186400',
            'x-cdn-enabled': 'False',
            'x-log-retention': 'True',
            'x-cdn-ios-uri': 'http://1762d02cb83dd4594008-edfcb31ae70ea7c07367728d50539bc7.iosr.cf1.rackcdn.com',
            'x-cdn-uri': 'http://cbebcab2b59eae3d0c71-edfcb31ae70ea7c07367728d50539bc7.r63.cf1.rackcdn.com',
            'content-type': 'text/html; charset=UTF-8',
            'x-cdn-streaming-uri': 'http://e5addf7be8783adf8c6d-edfcb31ae70ea7c07367728d50539bc7.r63.stream.cf1.rackcdn.com',
            'content-length': '0',
            'x-trans-id': 'tx8a8acb8f3f7142c8bd36f27a18415996',
            date: 'Wed, 12 Jun 2013 19:04:25 GMT',
            connection: 'keep-alive' })
          .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.3-90')
          .reply(204, '', {
            'x-cdn-ssl-uri': 'https://c98c1215ec09a78cd287-edfcb31ae70ea7c07367728d50539bc7.ssl.cf1.rackcdn.com',
            'x-ttl': '186400',
            'x-cdn-enabled': 'False',
            'x-log-retention': 'True',
            'x-cdn-ios-uri': 'http://1762d02cb83dd4594008-edfcb31ae70ea7c07367728d50539bc7.iosr.cf1.rackcdn.com',
            'x-cdn-uri': 'http://cbebcab2b59eae3d0c71-edfcb31ae70ea7c07367728d50539bc7.r63.cf1.rackcdn.com',
            'content-type': 'text/html; charset=UTF-8',
            'x-cdn-streaming-uri': 'http://e5addf7be8783adf8c6d-edfcb31ae70ea7c07367728d50539bc7.r63.stream.cf1.rackcdn.com',
            'content-length': '0',
            'x-trans-id': 'tx8a8acb8f3f7142c8bd36f27a18415996',
            date: 'Wed, 12 Jun 2013 19:04:25 GMT',
            connection: 'keep-alive' })
          .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.3-92')
          .reply(204, '', {
            'x-cdn-ssl-uri': 'https://c98c1215ec09a78cd287-edfcb31ae70ea7c07367728d50539bc7.ssl.cf1.rackcdn.com',
            'x-ttl': '186400',
            'x-cdn-enabled': 'False',
            'x-log-retention': 'True',
            'x-cdn-ios-uri': 'http://1762d02cb83dd4594008-edfcb31ae70ea7c07367728d50539bc7.iosr.cf1.rackcdn.com',
            'x-cdn-uri': 'http://cbebcab2b59eae3d0c71-edfcb31ae70ea7c07367728d50539bc7.r63.cf1.rackcdn.com',
            'content-type': 'text/html; charset=UTF-8',
            'x-cdn-streaming-uri': 'http://e5addf7be8783adf8c6d-edfcb31ae70ea7c07367728d50539bc7.r63.stream.cf1.rackcdn.com',
            'content-length': '0',
            'x-trans-id': 'tx8a8acb8f3f7142c8bd36f27a18415996',
            date: 'Wed, 12 Jun 2013 19:04:25 GMT',
            connection: 'keep-alive' })

      }

      client.getContainers({
        loadCDNAttributes: true
      }, function (err, containers) {
        should.not.exist(err);
        should.exist(containers);
        containers.should.have.length(5);
        containers.forEach(function (c) {
          c.should.be.instanceof(Container);
        });
        authServer && authServer.done();
        server && server.done();
        done();
      });
    });

    it('getContainers with limit should return reduced set', function (done) {

      if (mock) {
        server
          .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00?format=json&limit=3')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/getContainersLimit.json');
      }

      client.getContainers({ limit: 3 }, function (err, containers) {
        should.not.exist(err);
        should.exist(containers);
        containers.should.have.length(3);
        containers.forEach(function (c) {
          c.should.be.instanceof(Container);
        });
        server && server.done();
        done();
      });
    });

    it('getContainers with limit should return reduced set', function (done) {

      if (mock) {
        server
          .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00?format=json&limit=3')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/getContainersLimit.json');
      }

      client.getContainers({ limit: 3 }, function (err, containers) {
        should.not.exist(err);
        should.exist(containers);
        containers.should.have.length(3);
        containers.forEach(function (c) {
          c.should.be.instanceof(Container);
        });
        server && server.done();
        done();
      });
    });

    it('getContainers with marker should start offset appropriately', function (done) {

      if (mock) {
        server
          .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00?format=json&marker=0.1.3-90')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/getContainersMarker.json');
      }

      client.getContainers({ marker: '0.1.3-90' }, function (err, containers) {
        should.not.exist(err);
        should.exist(containers);
        containers.should.have.length(1);
        containers.forEach(function (c) {
          c.should.be.instanceof(Container);
        });
        server && server.done();
        done();
      });
    });

    it('getContainers with marker and limit should start offset appropriatley', function (done) {

      if (mock) {
        server
          .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00?format=json&limit=4&marker=0.1.3-85')
          .replyWithFile(200, __dirname + '/../../fixtures/rackspace/getContainersLimitMarker.json');
      }

      client.getContainers({ limit: 4, marker: '0.1.3-85' }, function (err, containers) {
        should.not.exist(err);
        should.exist(containers);
        containers.should.have.length(4);
        containers.forEach(function (c) {
          c.should.be.instanceof(Container);
        });
        server && server.done();
        done();
      });
    });

    it('getContainer should URL encode container names', function (done) {
      if (mock) {
        server
          .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/~!%40%23%24%25%5E%26*()_%2B')
          .reply(200, '', { 'content-length': '0',
            'x-container-object-count': '144',
            'x-container-meta-awesome': 'Tue Jun 04 2013 07:58:52 GMT-0700 (PDT)',
            'x-timestamp': '1368837729.84945',
            'x-container-meta-foo': 'baz',
            'x-container-bytes-used': '134015617',
            'content-type': 'application/json; charset=utf-8',
            'accept-ranges': 'bytes',
            'x-trans-id': 'txb0bcacabf853476e87f846ff0e85a22f',
            date: 'Thu, 13 Jun 2013 15:18:17 GMT',
            connection: 'keep-alive' }
          )
          .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/~!%40%23%24%25%5E%26*()_%2B')
          .reply(404);
      }

      client.getContainer('~!@#$%^&*()_+', function (err, container) {
        should.not.exist(err);
        should.exist(container);

        container.should.be.instanceof(Container);

        server && server.done();
        done();
      });

    });

    it('getContainer should allow 403 cdn response (for ACL)', function (done) {

      if (mock) {
        server
          .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.3-85')
          .reply(200, '', { 'content-length': '0',
            'x-container-object-count': '144',
            'x-container-meta-awesome': 'Tue Jun 04 2013 07:58:52 GMT-0700 (PDT)',
            'x-timestamp': '1368837729.84945',
            'x-container-meta-foo': 'baz',
            'x-container-bytes-used': '134015617',
            'content-type': 'application/json; charset=utf-8',
            'accept-ranges': 'bytes',
            'x-trans-id': 'txb0bcacabf853476e87f846ff0e85a22f',
            date: 'Thu, 13 Jun 2013 15:18:17 GMT',
            connection: 'keep-alive' }
          )
          .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.3-85')
          .reply(403);
      }

      client.getContainer('0.1.3-85', function (err, container) {
        should.not.exist(err);
        should.exist(container);

        container.should.be.instanceof(Container);

        server && server.done();
        done();
      });
    });

    it('getContainer should include cdn metadata', function (done) {

      if (mock) {
        server
          .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.3-85')
          .reply(200, '', { 'content-length': '0',
            'x-container-object-count': '144',
            'x-container-meta-awesome': 'Tue Jun 04 2013 07:58:52 GMT-0700 (PDT)',
            'x-timestamp': '1368837729.84945',
            'x-container-meta-foo': 'baz',
            'x-container-bytes-used': '134015617',
            'content-type': 'application/json; charset=utf-8',
            'accept-ranges': 'bytes',
            'x-trans-id': 'txb0bcacabf853476e87f846ff0e85a22f',
            date: 'Thu, 13 Jun 2013 15:18:17 GMT',
            connection: 'keep-alive' }
          )
          .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.3-85')
          .reply(200, '', {
            'x-cdn-ssl-uri': 'https://c98c1215ec09a78cd287-edfcb31ae70ea7c07367728d50539bc7.ssl.cf1.rackcdn.com',
            'x-ttl': '186400',
            'x-cdn-enabled': 'True',
            'x-log-retention': 'True',
            'x-cdn-ios-uri': 'http://1762d02cb83dd4594008-edfcb31ae70ea7c07367728d50539bc7.iosr.cf1.rackcdn.com',
            'x-cdn-uri': 'http://cbebcab2b59eae3d0c71-edfcb31ae70ea7c07367728d50539bc7.r63.cf1.rackcdn.com',
            'content-type': 'text/html; charset=UTF-8',
            'x-cdn-streaming-uri': 'http://e5addf7be8783adf8c6d-edfcb31ae70ea7c07367728d50539bc7.r63.stream.cf1.rackcdn.com',
            'content-length': '0',
            'x-trans-id': 'tx8a8acb8f3f7142c8bd36f27a18415996',
            date: 'Wed, 12 Jun 2013 19:04:25 GMT',
            connection: 'keep-alive' })
      }

      client.getContainer('0.1.3-85', function (err, container) {
        should.not.exist(err);
        should.exist(container);

        container.should.be.instanceof(Container);

        container.cdnEnabled.should.equal(true);
        container.cdnUri.should.equal('http://cbebcab2b59eae3d0c71-edfcb31ae70ea7c07367728d50539bc7.r63.cf1.rackcdn.com');
        server && server.done();
        done();
      });
    });

    it('getContainer and enable CDN ', function (done) {

      if (mock) {
        server
          .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.3-85')
          .reply(200, '', { 'content-length': '0',
            'x-container-object-count': '144',
            'x-container-meta-awesome': 'Tue Jun 04 2013 07:58:52 GMT-0700 (PDT)',
            'x-timestamp': '1368837729.84945',
            'x-container-meta-foo': 'baz',
            'x-container-bytes-used': '134015617',
            'content-type': 'application/json; charset=utf-8',
            'accept-ranges': 'bytes',
            'x-trans-id': 'txb0bcacabf853476e87f846ff0e85a22f',
            date: 'Thu, 13 Jun 2013 15:18:17 GMT',
            connection: 'keep-alive' }
          )
          .post('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.3-85', null, null)
          .reply(202)
          .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.3-85')
          .reply(404)
          .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.3-85')
          .reply(200, '', { 'content-length': '0',
            'x-container-object-count': '144',
            'x-container-meta-awesome': 'Tue Jun 04 2013 07:58:52 GMT-0700 (PDT)',
            'x-timestamp': '1368837729.84945',
            'x-container-meta-foo': 'baz',
            'x-container-bytes-used': '134015617',
            'content-type': 'application/json; charset=utf-8',
            'accept-ranges': 'bytes',
            'x-trans-id': 'txb0bcacabf853476e87f846ff0e85a22f',
            date: 'Thu, 13 Jun 2013 15:18:17 GMT',
            connection: 'keep-alive' }
        )
          .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/0.1.3-85')
          .reply(200, '', {
            'x-cdn-ssl-uri': 'https://c98c1215ec09a78cd287-edfcb31ae70ea7c07367728d50539bc7.ssl.cf1.rackcdn.com',
            'x-ttl': '186400',
            'x-cdn-enabled': 'True',
            'x-log-retention': 'True',
            'x-cdn-ios-uri': 'http://1762d02cb83dd4594008-edfcb31ae70ea7c07367728d50539bc7.iosr.cf1.rackcdn.com',
            'x-cdn-uri': 'http://cbebcab2b59eae3d0c71-edfcb31ae70ea7c07367728d50539bc7.r63.cf1.rackcdn.com',
            'content-type': 'text/html; charset=UTF-8',
            'x-cdn-streaming-uri': 'http://e5addf7be8783adf8c6d-edfcb31ae70ea7c07367728d50539bc7.r63.stream.cf1.rackcdn.com',
            'content-length': '0',
            'x-trans-id': 'tx8a8acb8f3f7142c8bd36f27a18415996',
            date: 'Wed, 12 Jun 2013 19:04:25'})
      }

      client.getContainer('0.1.3-85', function (err, container) {
        should.not.exist(err);
        should.exist(container);

        container.should.be.instanceof(Container);

        container.cdnEnabled.should.equal(false);
        should.not.exist(container.cdnUri);

        container.updateCdn({ enabled: true }, function (err, container) {
          should.not.exist(err);
          should.exist(container);
          container.should.be.instanceof(Container);

          container.cdnEnabled.should.equal(true);
          container.cdnUri.should.equal('http://cbebcab2b59eae3d0c71-edfcb31ae70ea7c07367728d50539bc7.r63.cf1.rackcdn.com');

          server && server.done();
          done();
        });
      });
    });

    it('updateContainerMetadata should throw if passed non container', function() {
      (function() {
        client.updateContainerMetadata({ name: 'foo' })
      }).should.throw();
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
});

