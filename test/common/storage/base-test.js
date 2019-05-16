/*
* base-test.js: Test that should be common to all providers.
*
* (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
*
*/

var fs = require('fs'),
    Buffer = require('buffer').Buffer,
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers'),
    should = require('should'),
    util = require('util'),
    async = require('async'),
    hock = require('hock'),
    http = require('http'),
    urlJoin = require('url-join'),
    request = require('request'),
    providers = require('../../configs/providers.json'),
    Container = require('../../../lib/pkgcloud/core/storage/container').Container,
    File = require('../../../lib/pkgcloud/core/storage/file').File,
    mock = !!process.env.MOCK,
    pkgcloud = require('../../../lib/pkgcloud'),
    fillerama = fs.readFileSync(helpers.fixturePath('fillerama.txt'), 'utf8'),
    bigFillerama = fs.readFileSync(helpers.fixturePath('bigfile.raw'));

// Declaring variables for helper functions defined later
var setupCreateContainerMock, setupGetContainersMock, setupUploadStreamMock,
    setupBigDataUploadStreamMock, setupDownloadStreamMock, setupBigDataDownloadStreamMock, setupGetFileMock,
    setupGetFilesMock, setupRemoveFileMock, setupDestroyContainerMock,
    setupGetContainers2Mock;

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].storage;
}).forEach(function (provider) {
  describe('pkgcloud/common/storage/base [' + provider + ']', function () {

    var config = null;

    if (!mock && provider === 'google') {
      config = {
        keyFilename: process.env.GCLOUD_KEYFILE,
        projectId: process.env.GCLOUD_PROJECT_ID
      };
    }

    var client = helpers.createClient(provider, 'storage', config),
      context = {},
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

    it('the createContainer() method should return newly created container', function(done) {

      if (mock) {
        setupCreateContainerMock(provider, client, {
          server: hockInstance,
          authServer: authHockInstance
        });
      }

      client.createContainer('pkgcloud-test-container', function(err, container) {
        should.not.exist(err);
        should.exist(container);
        container.should.be.instanceOf(Container);

        context.container = container;

        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        done();

      });
    });

    it('the getContainers() method should return newly created container', function (done) {

      if (mock) {
        setupGetContainersMock(provider, client, {
          server: hockInstance,
          authServer: authHockInstance
        });
      }

      client.getContainers(function (err, containers) {
        should.not.exist(err);
        should.exist(containers);
        containers.should.be.an.Array;

        containers.forEach(function(container) {
          container.should.be.instanceOf(Container);
        });

        // TODO Name check
        hockInstance && hockInstance.done();
        done();

      });
    });

    it('the upload() method with container and filename should succeed', function (done) {

      if (mock) {
        // FIXME: Added 'google' until finding a way to "simulate" upload
        if (provider === 'google') {
          // TODO: Remove once 'google' upload & download tests are functional
          context.file = {
            name: 'test-file.txt',
            size: Buffer.byteLength(fillerama)
          };
          return done();
        }

        setupUploadStreamMock(provider, client, {
          server: hockInstance,
          authServer: authHockInstance
        });
      }

      var stream = client.upload({
        container: context.container,
        remote: 'test-file.txt',
        headers: {'x-amz-acl': 'public-read'}
      });

      stream.on('error', function(err, response) {
        should.not.exist(err);
        should.not.exist(response);
        done();
      });

      stream.on('success', function(file) {
        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        file.should.be.an.instanceof(File);

        context.file = {
          name: 'test-file.txt',
          size: Buffer.byteLength(fillerama)
        };

        done();
      });

      var file = fs.createReadStream(helpers.fixturePath('fillerama.txt'));
      file.pipe(stream);
    });

    it('the download() method with container and filename should succeed', function (done) {

      if (mock) {
        // FIXME: Added 'google' until finding a way to "simulate" download
        if (provider === 'google') {
          return done();
        }

        setupDownloadStreamMock(provider, client, {
          server: hockInstance,
          authServer: authHockInstance
        });
      }

      var stream = client.download({
        container: context.container,
        remote: context.file.name
      });

      context.fileContents = '';

      stream.on('data', function (data) {
        context.fileContents += data;
      });

      stream.on('end', function() {
        context.fileContents.should.equal(fillerama);
        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the getFile() method with container and filename should succeed', function (done) {

      if (mock) {
        setupGetFileMock(provider, client, {
          server: hockInstance,
          authServer: authHockInstance
        });
      }

      client.getFile(context.container, context.file.name, function (err, file) {
          should.not.exist(err);
          should.exist(file);

          file.name.should.equal(context.file.name);
          file.size.should.equal(context.file.size);

          hockInstance && hockInstance.done();
          done();
        });
    });

    it('the getFiles() method with container should succeed', function (done) {

      if (mock) {
        setupGetFilesMock(provider, client, {
          server: hockInstance,
          authServer: authHockInstance
        });
      }

      client.getFiles(context.container, null, function (err, files) {
        should.not.exist(err);
        should.exist(files);

        files.should.be.an.Array;

        files.forEach(function(file) {
          file.should.be.instanceOf(File);
        });

        // TODO look for context.file in array

        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the removeFile() method with container and filename should succeed', function (done) {

      if (mock) {
        setupRemoveFileMock(provider, client, {
          server: hockInstance,
          authServer: authHockInstance
        });
      }

      client.removeFile(context.container, context.file.name, function (err, ok) {
        should.not.exist(err);
        should.exist(ok);

        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the upload() method with large file should succeed', function (done) {

      if (mock) {
        // TODO make it work for google
        // TODO make it work for azure - no idea why it fails on node 0.10 (it passes for node 6.8)
        if (['google', 'azure'].indexOf(provider) !== -1) {
          return done();
        }
        setupBigDataUploadStreamMock(provider, client, {
          server: hockInstance,
          authServer: authHockInstance
        });
      }

      var stream = client.upload({
        container: context.container,
        remote: 'bigfile.raw',
        headers: {'x-amz-acl': 'public-read'}
      });

      stream.on('error', function(err) {
        done(err);
      });

      stream.on('success', function(file) {
        authHockInstance && authHockInstance.done();
        hockInstance && hockInstance.done();
        file.should.be.an.instanceof(File);

        context.bigFile = {
          name: 'bigfile.raw',
          size: bigFillerama.length
        };

        done();
      });

      var file = fs.createReadStream(helpers.fixturePath('bigfile.raw'), {encoding: 'ascii'});
      file.pipe(stream);
    });

    it('the download() method with large file should succeed', function (done) {

      if (mock) {
        // TODO make it work for google
        // TODO make it work for azure - no idea why it fails on node 0.10 (it passes for node 6.8)
        if (['google', 'azure'].indexOf(provider) !== -1) {
          return done();
        }
        setupBigDataDownloadStreamMock(provider, client, {
          server: hockInstance,
          authServer: authHockInstance
        });
      }

      var stream = client.download({
        container: context.container,
        remote: context.bigFile.name
      });

      context.fileContents = [];
      context.fileContentsSize = 0;
      stream.on('data', function (data) {
        context.fileContents.push(data);
        context.fileContentsSize += data.length;
      });

      stream.on('error', function(err) {
        return done(err);
      });

      stream.on('end', function() {
        hockInstance && hockInstance.done();

        context.fileContents = Buffer.concat(context.fileContents,
          context.fileContentsSize).toString('ascii');

        //Compare byte by byte
        var original = bigFillerama.toString('ascii');
        for (var i = 0; i < original.length; i++) {
          assert.equal(context.fileContents[i], original[i]);
        }

        return done();
      });
    });

    it('the destroyContainer() method with container should succeed', function (done) {
      if (mock) {
        setupDestroyContainerMock(provider, client, {
          server: hockInstance,
          authServer: authHockInstance
        });
      }

      client.destroyContainer(context.container, function (err, ok) {
        should.not.exist(err);
        should.exist(ok);

        hockInstance && hockInstance.done();
        done();
      });
    });

    it('the getContainers() method should succeed', function (done) {
      if (mock) {
        setupGetContainers2Mock(provider, client, {
          server: hockInstance,
          authServer: authHockInstance
        });
      }

      client.getContainers(function (err, ok) {
        should.not.exist(err);
        should.exist(ok);

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
});

setupCreateContainerMock = function (provider, client, servers) {
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
      .defaultReplyHeaders(helpers.rackspaceResponseHeaders())
      .put('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container')
      .reply(201);
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
      .put('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container')
      .reply(201);
  }
  else if (provider === 'amazon') {
    servers.server
      .put('/', '<CreateBucketConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><LocationConstraint>us-west-2</LocationConstraint></CreateBucketConfiguration>')
      .reply(200);
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
      .put('/pkgcloud-test-container?restype=container')
      .reply(201, '', helpers.azureResponseHeaders());
  }
  else if (provider === 'google') {
    servers.server
      .post('/storage/v1/b?project=test-project', {
        name: 'pkgcloud-test-container'
      })
      .replyWithFile(200, __dirname + '/../../fixtures/google/create-bucket.json');
    
    client.storage.baseUrl = client.storage.baseUrl.replace(/.*\.com/, 'http://localhost:12345');
    client.storage.makeAuthenticatedRequest = function (reqOpts, callback) {
      reqOpts.uri = reqOpts.uri.replace(/.*\.com/, 'http://localhost:12345');
      return request(reqOpts, callback);
    };

    client.storage.authClient.request = function (reqOpts) {
      reqOpts.url = reqOpts.url.replace(/.*\.com/, 'http://localhost:12345');
      return request(reqOpts);
    };
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
      .put('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container')
      .reply(201);
  }
};

setupGetContainersMock = function (provider, client, servers) {
  if (provider === 'rackspace' || provider === 'openstack') {
    servers.server
      .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00?format=json')
      .reply(200, helpers.loadFixture('rackspace/postContainers.json'));
  }
  else if (provider === 'amazon') {
    servers.server
      .get('/')
      .reply(200, helpers.loadFixture('amazon/list-buckets.xml'));
  }
  else if (provider === 'azure') {
    servers.server
      .get('/?comp=list')
      .reply(200, helpers.loadFixture('azure/list-containers.xml'),helpers.azureResponseHeaders());
  }
  else if (provider === 'google') {
    servers.server
      .get('/storage/v1/b?project=test-project')
      .replyWithFile(200, __dirname + '/../../fixtures/google/get-buckets.json');
  }
  else if (provider === 'hp') {
    servers.server
      .get('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00?format=json')
      .reply(200, helpers.loadFixture('hp/postContainers.json'));
  }
};

setupUploadStreamMock = function (provider, client, servers) {
  if (provider === 'rackspace' || provider === 'openstack') {
    servers.server
      .put('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt', fillerama)
      .reply(200)
      .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt?format=json')
      .reply(200, '', { 'content-length': fillerama.length + 2 });
  }
  else if (provider === 'amazon') {
    servers.server
      .put('/test-file.txt', fillerama)
      .reply(200);

  }
  else if (provider === 'azure') {
    servers.server
      .put('/pkgcloud-test-container/test-file.txt?comp=block&blockid=block000000000000000', fillerama)
      .reply(201, '', helpers.azureResponseHeaders({'content-md5': 'mw0KEVFFwT8SgYGK3Cu8vg=='}))
      .put('/pkgcloud-test-container/test-file.txt?comp=blocklist', '<?xml version="1.0" encoding="utf-8"?><BlockList><Latest>block000000000000000</Latest></BlockList>')
      .reply(201, '', helpers.azureResponseHeaders({'content-md5': 'VuFw1xub9CF3KoozbZ3kZw=='}))
      .get('/pkgcloud-test-container/test-file.txt')
      .reply(200, fillerama, helpers.azureGetFileResponseHeaders({'content-length': fillerama.length + 2, 'content-type': 'text/plain'}));
  }
  else if (provider === 'hp') {
    servers.server
      .put('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt', fillerama)
      .reply(200)
      .head('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt?format=json')
      .reply(200, '', { 'content-length': fillerama.length + 2 });
  }
};

setupBigDataUploadStreamMock = function (provider, client, servers) {
  if (provider === 'rackspace' || provider === 'openstack') {
    servers.server
      .put('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/bigfile.raw', bigFillerama.toString('ascii'))
      .reply(200)
      .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/bigfile.raw?format=json')
      .reply(200, '', { 'content-length': bigFillerama.length + 2 });
  }
  else if (provider === 'amazon') {
    servers.server
      .post('/bigfile.raw?uploads')
      .reply(200, '<?xml version="1.0" encoding="UTF-8"?>\n<InitiateMultipartUploadResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Bucket>pkgcloud-test-container</Bucket><Key>bigfile.raw</Key><UploadId>U4vzbMZVEkBOyxMPHMCu7nRSUw.eNLeqK0oYOPA6BeeiDSu6OTjrsMkkTsOFav3qCpgvIJluGWe_Yi.ypTVxEg--</UploadId></InitiateMultipartUploadResult>', {})
      .put('/bigfile.raw?partNumber=1&uploadId=U4vzbMZVEkBOyxMPHMCu7nRSUw.eNLeqK0oYOPA6BeeiDSu6OTjrsMkkTsOFav3qCpgvIJluGWe_Yi.ypTVxEg--', bigFillerama.slice(0, 5*1024*1024).toString('ascii'))
      .reply(200, '<?xml version="1.0" encoding="UTF-8"?>\n\n<CompleteMultipartUploadResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Location>https://pkgcloud-test-container.s3.amazonaws.com/bigfile.raw</Location><Bucket>pkgcloud-test-container</Bucket><Key>bigfile.raw</Key><ETag>&quot;b2286fe4aac65809a1b7a053d07fc99f-1&quot;</ETag></CompleteMultipartUploadResult>')
      .put('/bigfile.raw?partNumber=2&uploadId=U4vzbMZVEkBOyxMPHMCu7nRSUw.eNLeqK0oYOPA6BeeiDSu6OTjrsMkkTsOFav3qCpgvIJluGWe_Yi.ypTVxEg--', bigFillerama.slice(5*1024*1024, 10*1024*1024).toString('ascii'))
    .reply(200, '<?xml version="1.0" encoding="UTF-8"?>\n\n<CompleteMultipartUploadResult xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Location>https://pkgcloud-test-container.s3.amazonaws.com/bigfile.raw</Location><Bucket>pkgcloud-test-container</Bucket><Key>bigfile.raw</Key><ETag>&quot;b2286fe4aac65809a1b7a053d07fc99f-2&quot;</ETag></CompleteMultipartUploadResult>')
    .post('/bigfile.raw?uploadId=U4vzbMZVEkBOyxMPHMCu7nRSUw.eNLeqK0oYOPA6BeeiDSu6OTjrsMkkTsOFav3qCpgvIJluGWe_Yi.ypTVxEg--', '<CompleteMultipartUpload xmlns="http://s3.amazonaws.com/doc/2006-03-01/"><Part><ETag>"b2286fe4aac65809a1b7a053d07fc99f-1"</ETag><PartNumber>1</PartNumber></Part><Part><ETag>"b2286fe4aac65809a1b7a053d07fc99f-2"</ETag><PartNumber>2</PartNumber></Part></CompleteMultipartUpload>')
    .reply(200);
  }
  else if (provider === 'azure') {
    servers.server
      .put('/pkgcloud-test-container/bigfile.raw?comp=block&blockid=block000000000000000', bigFillerama.slice(0, 4*1024*1024).toString('ascii'))
      .reply(201, '', helpers.azureResponseHeaders({'content-md5': 'mw0KEVFFwT8SgYGK3Cu8vg=='}))
      .put('/pkgcloud-test-container/bigfile.raw?comp=block&blockid=block000000000000001', bigFillerama.slice(4*1024*1024, 8*1024*1024).toString('ascii'))
      .reply(201, '', helpers.azureResponseHeaders({'content-md5': 'mw0KEVFFwT8SgYGK3Cu8vg=='}))
      .put('/pkgcloud-test-container/bigfile.raw?comp=block&blockid=block000000000000002', bigFillerama.slice(8*1024*1024).toString('ascii'))
      .reply(201, '', helpers.azureResponseHeaders({'content-md5': 'mw0KEVFFwT8SgYGK3Cu8vg=='}))
      .put('/pkgcloud-test-container/bigfile.raw?comp=blocklist', '<?xml version="1.0" encoding="utf-8"?><BlockList><Latest>block000000000000000</Latest><Latest>block000000000000001</Latest><Latest>block000000000000002</Latest></BlockList>')
      .reply(201, '', helpers.azureResponseHeaders({'content-md5': 'VuFw1xub9CF3KoozbZ3kZw=='}))
      .get('/pkgcloud-test-container/bigfile.raw')
      .reply(200, bigFillerama.toString('ascii'), helpers.azureGetFileResponseHeaders({'content-length': bigFillerama.length + 2, 'content-type': 'text/plain'}));
  }
  else if (provider === 'hp') {
    servers.server
      .put('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/bigfile.raw', bigFillerama.toString('ascii'))
      .reply(200)
      .head('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/bigfile.raw?format=json')
      .reply(200, '', { 'content-length': bigFillerama.length + 2 });
  }
};

setupDownloadStreamMock = function (provider, client, servers) {
  if (provider === 'rackspace' || provider === 'openstack') {
    servers.server
      .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt')
      .reply(200, fillerama, { 'content-length': fillerama.length + 2});
  }
  else if (provider === 'amazon') {
    servers.server
      .get('/test-file.txt')
      .reply(200, fillerama, { 'content-length': fillerama.length + 2 });
  }
  else if (provider === 'azure') {
    servers.server
      .get('/pkgcloud-test-container/test-file.txt')
      .reply(200, fillerama, helpers.azureGetFileResponseHeaders({'content-length': fillerama.length + 2,'content-type': 'text/plain'}));
  }
  else if (provider === 'google') {
    servers.server
      .get('/storage/v1/b/pkgcloud-test-container/o/test-file.txt')
      .reply(200, { mediaLink: 'http://localhost:12345/mediaLink' })
      .get('/storage/v1/b/pkgcloud-test-container/o/test-file.txt?alt=media')
      .reply(200, { mediaLink: 'http://localhost:12345/mediaLink' })
      .get('/mediaLink')
      .reply(200, fillerama);
  }
  else if (provider === 'hp') {
    servers.server
      .get('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt')
      .reply(200, fillerama, { 'content-length': fillerama.length + 2});
  }
};

setupBigDataDownloadStreamMock = function (provider, client, servers) {
  if (provider === 'rackspace' || provider === 'openstack') {
    servers.server
      .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/bigfile.raw')
      .reply(200, bigFillerama.toString('ascii'));
  }
  else if (provider === 'amazon') {
    servers.server
      .get('/bigfile.raw')
      .reply(200, bigFillerama.toString('ascii'));
  }
  else if (provider === 'azure') {
    servers.server
      .get('/pkgcloud-test-container/bigfile.raw')
      .reply(200, bigFillerama.toString('ascii'), helpers.azureGetFileResponseHeaders({'content-type': 'text/plain'}));
  }
  else if (provider === 'google') {
    servers.server
      .get('/storage/v1/b/pkgcloud-test-container/o/bigfile.raw')
      .reply(200, { mediaLink: 'http://localhost:12345/mediaLink' })
      .get('/mediaLink')
      .reply(200, bigFillerama.toString('ascii'));
  }
  else if (provider === 'hp') {
    servers.server
      .get('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/bigfile.raw')
      .reply(200, bigFillerama.toString('ascii'));
  }
};

setupGetFileMock = function (provider, client, servers) {
  if (provider === 'rackspace' || provider === 'openstack') {
    servers.server
      .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt?format=json')
      .reply(200, '', { 'content-length': fillerama.length + 2 });
  }
  else if (provider === 'amazon') {
    servers.server
      .head('/test-file.txt')
      .reply(200, '', { 'content-length': fillerama.length + 2 });
  }
  else if (provider === 'azure') {
    servers.server
      .get('/pkgcloud-test-container/test-file.txt')
      .reply(200, fillerama, helpers.azureGetFileResponseHeaders({'content-length': fillerama.length + 2, 'content-type': 'text/plain'}));
  }
  else if (provider === 'google') {
    client.storage.request = function (reqOpts, callback) {
      reqOpts.uri = urlJoin('http://localhost:12345/storage/v1', reqOpts.uri);
      return request(reqOpts, (err, response, body) => callback(err, body? JSON.parse(body): body));
    };
    servers.server
      .get('/storage/v1/b/pkgcloud-test-container/o/test-file.txt')
      .replyWithFile(200, __dirname + '/../../fixtures/google/get-file.json');
  }
  else if (provider === 'hp') {
    servers.server
      .head('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt?format=json')
      .reply(200, '', { 'content-length': fillerama.length + 2 });
  }
};

setupGetFilesMock = function (provider, client, servers) {
  if (provider === 'rackspace' || provider === 'openstack') {
    servers.server
      .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container?format=json')
      .reply(200, [{
        bytes: fillerama.length,
        name: 'test-file.txt',
        content_type: 'text/plain'
      }]);
  }
  else if (provider === 'amazon') {
    servers.server
      .get('/')
      .reply(200, helpers.loadFixture('amazon/list-bucket-files.xml'));
  }
  else if (provider === 'azure') {
    servers.server
      .get('/pkgcloud-test-container?restype=container&comp=list')
      .reply(200, helpers.loadFixture('azure/list-container-files.xml'), helpers.azureResponseHeaders({'content-type': 'application/xml'}));
  }
  else if (provider === 'google') {
    servers.server
      .get('/storage/v1/b/pkgcloud-test-container/o')
      .replyWithFile(200, __dirname + '/../../fixtures/google/get-files.json');
  }
  else if (provider === 'hp') {
    servers.server
      .get('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container?format=json')
      .reply(200, [{
        bytes: fillerama.length,
        name: 'test-file.txt',
        content_type: 'text/plain'
      }]);
  }
};

setupRemoveFileMock = function (provider, client, servers) {
  if (provider === 'rackspace' || provider === 'openstack') {
    servers.server
      .delete('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt')
      .reply(204, '');
  }
  else if (provider === 'amazon') {
    servers.server
      .delete('/test-file.txt')
      .reply(204);
  }
  else if (provider === 'azure') {
    servers.server
      .delete('/pkgcloud-test-container/test-file.txt')
      .reply(202, '', helpers.azureDeleteResponseHeaders());
  }
  else if (provider === 'google') {
    servers.server
      .delete('/storage/v1/b/pkgcloud-test-container/o/test-file.txt')
      .reply(204, {});
  }
  else if (provider === 'hp') {
    servers.server
      .delete('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt')
      .reply(204, '');
  }
};

setupDestroyContainerMock = function (provider, client, servers) {
  if (provider === 'openstack') {
    servers.server
      .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container')
      .reply(200, {}, {
        'x-container-object-count': 1,
        'x-container-bytes-used': fillerama.length
      })
      .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container?format=json&limit=1001')
      .reply(200, [
        {
          bytes: fillerama.length,
          name: 'test-file.txt',
          content_type: 'text/plain'
        }
      ])
      .delete('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt')
      .reply(204, '')
      .delete('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container')
      .reply(204);
  }
  else if (provider === 'rackspace') {
    servers.server
      .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container')
      .reply(200, {}, {
        'x-container-object-count': 1,
        'x-container-bytes-used': fillerama.length
      })
      .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container')
      .reply(200, {}, {
        'x-container-object-count': 1,
        'x-container-bytes-used': fillerama.length
      })
      .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container?format=json&limit=1001')
      .reply(200, [
        {
          bytes: fillerama.length,
          name: 'test-file.txt',
          content_type: 'text/plain'
        }
      ])
      .delete('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt')
      .reply(204, '')
      .delete('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container')
      .reply(204);
  }
  else if (provider === 'amazon') {
    servers.server
      .get('/')
      .reply(200, helpers.loadFixture('amazon/list-bucket-files.xml'), {})
      .delete('/')
      .reply(204)
      .delete('/test-file.txt')
      .reply(204);
  }
  else if (provider === 'azure') {
    servers.server
      .delete('/pkgcloud-test-container?restype=container')
      .reply(202, '', helpers.azureDeleteResponseHeaders());
  }
  else if (provider === 'google') {
    servers.server
      .get('/storage/v1/b/pkgcloud-test-container/o')
      .replyWithFile(200, __dirname + '/../../fixtures/google/get-files.json')
      .delete('/storage/v1/b/pkgcloud-test-container/o/test-file.txt')
      .reply(204, {})
      .delete('/storage/v1/b/pkgcloud-test-container')
      .reply(204, {});
  }
  else if (provider === 'hp') {
    servers.server
      .head('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container')
      .reply(200, {}, {
        'x-container-object-count': 1,
        'x-container-bytes-used': fillerama.length
      })
      .get('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container?format=json&limit=1001')
      .reply(200, [
        {
          bytes: fillerama.length,
          name: 'test-file.txt',
          content_type: 'text/plain'
        }
      ])
      .delete('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt')
      .reply(204, '')
      .delete('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container')
      .reply(204);
  }
};

setupGetContainers2Mock = function (provider, client, servers) {
  if (provider === 'rackspace' || provider === 'openstack') {
    servers.server
      .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00?format=json')
      .reply(200, helpers.loadFixture('rackspace/preContainers.json'));
  }
  else if (provider === 'amazon') {
    servers.server
      .get('/')
      .reply(200, helpers.loadFixture('amazon/list-buckets2.xml'));
  }
  else if (provider === 'azure') {
    servers.server
      .get('/?comp=list')
      .reply(200, helpers.loadFixture('azure/list-containers2.xml'), helpers.azureResponseHeaders());
  }
  else if (provider === 'google') {
    servers.server
      .get('/storage/v1/b?project=test-project')
      .replyWithFile(200, __dirname + '/../../fixtures/google/get-buckets.json');
  }
  else if (provider === 'hp') {
    servers.server
      .get('/v1/HPCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00?format=json')
      .reply(200, helpers.loadFixture('hp/preContainers.json'));
  }
};
