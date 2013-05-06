/*
* base-test.js: Test that should be common to all providers.
*
* (C) 2012 Nodejitsu Inc.
*
*/

var fs = require('fs'),
    path = require('path'),
    Buffer = require('buffer').Buffer,
    assert = require('../../helpers/assert'),
    helpers = require('../../helpers'),
    should = require('should'),
    utile = require('utile'),
    async = require('async'),
    hock = require('hock'),
    urlJoin = require('url-join'),
    _ = require('underscore'),
    providers = require('../../configs/providers.json'),
    versions = require('../../fixtures/versions.json'),
    Container = require('../../../lib/pkgcloud/core/storage/container').Container,
    File = require('../../../lib/pkgcloud/core/storage/file').File,
    mock = !!process.env.MOCK,
    fillerama = fs.readFileSync(helpers.fixturePath('fillerama.txt'), 'utf8');

providers.filter(function (provider) {
  return !!helpers.pkgcloud.providers[provider].storage;
}).forEach(function (provider) {
  describe('pkgcloud/common/storage/base [' + provider + ']', function () {

    var client = helpers.createClient(provider, 'storage'),
        context = {},
        authServer, server;

    before(function (done) {

      if (!mock) {
        return done();
      }

      async.parallel([
        function (next) {
          hock.createHock(12345, function (err, hockClient) {
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

    it('the createContainer() method should return newly created container', function(done) {

      if (mock) {
        if (provider === 'joyent') {
          // TODO figure out why joyent was disabled in vows based tests
          return done();
        }

        setupCreateContainerMock(provider, client, {
          server: server,
          authServer: authServer
        });
      }

      client.createContainer('pkgcloud-test-container', function(err, container) {
        should.not.exist(err);
        should.exist(container);
        container.should.be.instanceOf(Container);

        context.container = container;

        authServer && authServer.done();
        server && server.done();
        done();

      });
    });

    it('the getContainers() method should return newly created container', function (done) {

      if (mock) {
        if (provider === 'joyent') {
          // TODO figure out why joyent was disabled in vows based tests
          return done();
        }

        setupGetContainersMock(provider, client, {
          server: server,
          authServer: authServer
        });
      }

      client.getContainers(function (err, containers) {
        should.not.exist(err);
        should.exist(containers);
        containers.should.be.instanceOf(Array);

        containers.forEach(function(container) {
          container.should.be.instanceOf(Container);
        });

        // TODO Name check
        server && server.done();
        done();

      });
    });

    it('the upload() method with container and filename should succeed', function (done) {

      if (mock) {
        if (provider === 'joyent') {
          // TODO figure out why joyent was disabled in vows based tests
          return done();
        }

        setupUploadStreamMock(provider, client, {
          server: server,
          authServer: authServer
        });
      }

      var stream = client.upload({
        container: context.container,
        remote: 'test-file.txt',
        headers: {'x-amz-acl': 'public-read'}
      }, function(err, ok, response) {
        should.not.exist(err);
        should.exist(ok);

        context.file = {
          name: 'test-file.txt',
          size: Buffer.byteLength(fillerama)
        };

        should.exist(response);
        should.exist(response.statusCode);
        should.exist(response.headers);

        server && server.done();
        done();
      });

      var file = fs.createReadStream(helpers.fixturePath('fillerama.txt'));
      file.pipe(stream);
    });

    it('the download() method with container and filename should succeed', function (done) {

      if (mock) {
        if (provider === 'joyent') {
          // TODO figure out why joyent was disabled in vows based tests
          return done();
        }

        setupDownloadStreamMock(provider, client, {
          server: server,
          authServer: authServer
        });
      }

      var stream = client.download({
        container: context.container,
        remote: context.file.name
      }, function (err, file) {
        should.not.exist(err);
        should.exist(file);

        file.name.should.equal(context.file.name);
        context.fileContents.should.equal(fillerama);
        file.size.should.equal(Buffer.byteLength(context.fileContents));

        server && server.done();
        done();
      });

      context.fileContents = '';
      stream.on('data', function (data) {
        context.fileContents += data;
      });
      stream.end();
    });

    it('the download() method with container and filename should succeed', function (done) {

      if (mock) {
        if (provider === 'joyent') {
          // TODO figure out why joyent was disabled in vows based tests
          return done();
        }

        setupDownloadStreamMock(provider, client, {
          server: server,
          authServer: authServer
        });
      }

      var stream = client.download({
        container: context.container,
        remote: context.file.name
      }, function (err, file) {
        should.not.exist(err);
        should.exist(file);

        file.name.should.equal(context.file.name);
        context.fileContents.should.equal(fillerama);
        file.size.should.equal(Buffer.byteLength(context.fileContents));

        server && server.done();
        done();
      });

      context.fileContents = '';
      stream.on('data', function (data) {
        context.fileContents += data;
      });
      stream.end();
    });

    it('the getFile() method with container and filename should succeed', function (done) {

      if (mock) {
        if (provider === 'joyent') {
          // TODO figure out why joyent was disabled in vows based tests
          return done();
        }

        setupGetFileMock(provider, client, {
          server: server,
          authServer: authServer
        });
      }

      client.getFile(context.container, context.file.name, function (err, file) {
          should.not.exist(err);
          should.exist(file);

          file.name.should.equal(context.file.name);
          file.size.should.equal(context.file.size);

          server && server.done();
          done();
        });
    });

    it('the getFiles() method with container should succeed', function (done) {

      if (mock) {
        if (provider === 'joyent') {
          // TODO figure out why joyent was disabled in vows based tests
          return done();
        }

        setupGetFilesMock(provider, client, {
          server: server,
          authServer: authServer
        });
      }

      client.getFiles(context.container, false, function (err, files) {
        should.not.exist(err);
        should.exist(files);

        files.should.be.instanceOf(Array);

        files.forEach(function(file) {
          file.should.be.instanceOf(File);
        })

        // TODO look for context.file in array

        server && server.done();
        done();
      });
    });

    it('the removeFile() method with container and filename should succeed', function (done) {

      if (mock) {
        if (provider === 'joyent') {
          // TODO figure out why joyent was disabled in vows based tests
          return done();
        }

        setupRemoveFileMock(provider, client, {
          server: server,
          authServer: authServer
        });
      }

      client.removeFile(context.container, context.file.name, function (err, ok) {
        should.not.exist(err);
        should.exist(ok);

        server && server.done();
        done();
      });
    });

    it('the upload() method with large file should succeed', function (done) {

      if (mock) {
        return done();
        // TODO mock these out
      }

      var stream = client.upload({
        container: context.container,
        remote: 'bigfile.raw'
      }, function (err, ok) {
        should.not.exist(err);
        should.exist(ok);

        context.file = {
          name: 'bigfile.raw',
          size: fs.readFileSync(helpers.fixturePath('bigfile.raw')).length
        };

        done();
      });

      var file = fs.createReadStream(helpers.fixturePath('bigfile.raw'));
      file.pipe(stream);
    });

    it('the download() method with large file should succeed', function (done) {

      if (mock) {
        return done();
        // TODO mock these out
      }

      var stream = client.download({
        container: context.container,
        remote: context.file.name
      }, function (err, file) {

        should.not.exist(err);
        should.exist(file);
        file.should.be.instanceOf(File);

        file.name.should.equal(context.file.name);
        file.size.should.equal(context.fileContentsSize);

        context.fileContents = Buffer.concat(context.fileContents,
          file.size);

        // Compare byte by byte
        var original = fs.readFileSync(helpers.fixturePath('bigfile.raw'));
        for (var i = 0; i < file.size; i++) {
          assert.equal(context.fileContents[i], original[i]);
        }

        done();
      });

      context.fileContents = [];
      context.fileContentsSize = 0;
      stream.on('data', function (data) {
        context.fileContents.push(data);
        context.fileContentsSize += data.length;
      });
      stream.end();
    });

    it('the destroyContainer() method with container should succeed', function (done) {

      if (mock) {
        if (provider === 'joyent') {
          // TODO figure out why joyent was disabled in vows based tests
          return done();
        }

        setupDestroyContainerMock(provider, client, {
          server: server,
          authServer: authServer
        });
      }

      client.destroyContainer(context.container, function (err, ok) {
        should.not.exist(err);
        should.exist(ok);

        server && server.done();
        done();
      });
    });

    it('the getContainers() method should succeed', function (done) {

      if (mock) {
        if (provider === 'joyent') {
          // TODO figure out why joyent was disabled in vows based tests
          return done();
        }

        setupGetContainers2Mock(provider, client, {
          server: server,
          authServer: authServer
        });
      }

      client.getContainers(function (err, ok) {
        should.not.exist(err);
        should.exist(ok);

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
});

function setupCreateContainerMock(provider, client, servers) {
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
      .replyWithFile(200, __dirname + '/../../fixtures/rackspace/auth.json');

    servers.server
      .defaultReplyHeaders(helpers.rackspaceResponseHeaders())
      .put('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container')
      .reply(201);
  }
  else if (provider === 'amazon') {

    // Override the clients getUrl method as it tries to prefix the container name onto the request
    client.getUrl = function (options) {
      options = options || {};

      if (typeof options === 'string') {
        return urlJoin(this.protocol + this.serversUrl, options);
      }

      return urlJoin(this.protocol + this.serversUrl, options.path);
    };

    servers.server
      .put('/')
      .reply(200);
  }
  else if (provider === 'azure') {

    // Override the clients getUrl method as it tries to prefix the container name onto the request
    client.getUrl = function (options) {
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
}

function setupGetContainersMock(provider, client, servers) {
  if (provider === 'rackspace') {
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
      .reply(200, helpers.loadFixture('azure/list-containers.xml'),helpers.azureResponseHeaders())
  }
}

function setupUploadStreamMock(provider, client, servers) {
  if (provider === 'rackspace') {
    servers.server
      .put('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt', fillerama)
      .reply(200)
  }
  else if (provider === 'amazon') {
    servers.server
      .put('/test-file.txt', fillerama)
      .reply(200, '', {})
  }
  else if (provider === 'azure') {
    servers.server
      .put('/pkgcloud-test-container/test-file.txt?comp=block&blockid=block000000000000000', fillerama)
      .reply(201, '', helpers.azureResponseHeaders({'content-md5': 'mw0KEVFFwT8SgYGK3Cu8vg=='}))
      .put('/pkgcloud-test-container/test-file.txt?comp=blocklist', "<?xml version=\"1.0\" encoding=\"utf-8\"?><BlockList><Latest>block000000000000000</Latest></BlockList>")
      .reply(201, '', helpers.azureResponseHeaders({'content-md5': 'VuFw1xub9CF3KoozbZ3kZw=='}))
  }
}

function setupDownloadStreamMock(provider, client, servers) {
  if (provider === 'rackspace') {
    servers.server
      .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt')
      .reply(200, fillerama, { 'content-length': fillerama.length + 2})
  }
  else if (provider === 'amazon') {
    servers.server
      .get('/test-file.txt')
      .reply(200, fillerama, { 'content-length': fillerama.length + 2 })
  }
  else if (provider === 'azure') {
    servers.server
      .get('/pkgcloud-test-container/test-file.txt')
      .reply(200, fillerama, helpers.azureGetFileResponseHeaders({'content-length': fillerama.length + 2,'content-type': 'text/plain'}))
  }
}

function setupGetFileMock(provider, client, servers) {
  if (provider === 'rackspace') {
    servers.server
      .head('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container/test-file.txt?format=json')
      .reply(200, '', { 'content-length': fillerama.length + 2 })
  }
  else if (provider === 'amazon') {
    servers.server
      .head('/test-file.txt')
      .reply(200, '', { 'content-length': fillerama.length + 2 })
  }
  else if (provider === 'azure') {
    servers.server
      .get('/pkgcloud-test-container/test-file.txt')
      .reply(200, '', helpers.azureGetFileResponseHeaders({'content-length': fillerama.length + 2, 'content-type': 'text/plain'}))
  }
}

function setupGetFilesMock(provider, client, servers) {
  if (provider === 'rackspace') {
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
      .reply(200, helpers.loadFixture('amazon/list-bucket-files.xml'))
  }
  else if (provider === 'azure') {
    servers.server
      .get('/pkgcloud-test-container?restype=container&comp=list')
      .reply(200, helpers.loadFixture('azure/list-container-files.xml'), helpers.azureResponseHeaders({'content-type': 'application/xml'}))
  }
}

function setupRemoveFileMock(provider, client, servers) {
  if (provider === 'rackspace') {
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
      .reply(202, '', helpers.azureDeleteResponseHeaders())
  }
}

function setupDestroyContainerMock(provider, client, servers) {
  if (provider === 'rackspace') {
    servers.server
      .get('/v1/MossoCloudFS_00aa00aa-aa00-aa00-aa00-aa00aa00aa00/pkgcloud-test-container?format=json')
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
}

function setupGetContainers2Mock(provider, client, servers) {
  if (provider === 'rackspace') {
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
      .reply(200, helpers.loadFixture('azure/list-containers2.xml'), helpers.azureResponseHeaders())
  }
}