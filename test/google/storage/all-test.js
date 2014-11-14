var helpers = require('../../helpers'),
  fs = require('fs'),
  assert = require('../../helpers/assert'),
  http = require('http'),
  hock = require('hock'),
  mock = !!process.env.MOCK,
  request = require('request'),
  through = require('through2');

describe('pkgcloud/google/storage', function () {
  var FILE_NAME = 'package.json',
    CONTAINER_NAME = mock ? 'test-bucket' : 'pkgcloud-temp-container-' + Date.now(),
    container,
    client,
    hockInstance;

  before(function (done) {
    var config = null;

    if (!mock) {
      config = {
        keyFilename: process.env.GCLOUD_KEYFILE,
        projectId: process.env.GCLOUD_PROJECT_ID
      };
    }

    client = helpers.createClient('google', 'storage', config);

    if (!mock) {
      return createContainer();
    }

    hockInstance = hock.createHock();

    server = http.createServer(hockInstance.handler);
    server.listen(12345, createContainer);

    overrideGcloudRequester();

    function createContainer() {
      if (mock) {
        hockInstance
          .post('/storage/v1/b?project=test-project', {
            name: CONTAINER_NAME
          })
          .replyWithFile(200, __dirname + '/../../fixtures/google/create-bucket.json');
      }

      client.createContainer(CONTAINER_NAME, function(err, c) {
        assert.ifError(err);
        container = c;

        hockInstance && hockInstance.done();
        done();
      });
    }

    function overrideGcloudRequester() {
      client.storage.connection_.createAuthorizedReq = function (reqOpts, callback) {
        reqOpts.uri = reqOpts.uri.replace(/.*\.com/, 'http://localhost:12345');
        callback(null, reqOpts);
      };

      client.storage.connection_.req = function (reqOpts, callback) {
        reqOpts.uri = reqOpts.uri.replace(/.*\.com/, 'http://localhost:12345');
        client.storage.connection_.requester(reqOpts, callback);
      };

      client.storage.connection_.requester = function (reqOpts, callback) {
        if (reqOpts.qs && reqOpts.qs.uploadType === 'multipart') {
          var stream = through();
          stream.on('finish', function () {
            fs.readFile(__dirname + '/../../fixtures/google/create-file.json', function(err, file) {
              if (err) {
                return stream.emit('error', err);
              }
              stream.emit('complete', { body: JSON.parse(file) });
            });
          });
          return stream;
        }

        if (reqOpts.uri === 'http://localhost:12345/mediaLink') {
          return fs.createReadStream('./package.json');
        }

        return request(reqOpts, callback);
      };
    }
  });

  after(function (done) {
    if (mock) {
      hockInstance
        .get('/storage/v1/b/test-bucket/o')
        .replyWithFile(200, __dirname + '/../../fixtures/google/get-files.json');

      hockInstance
        .delete('/storage/v1/b/test-bucket/o/package.json')
        .reply(204, {});

      hockInstance
        .delete('/storage/v1/b/test-bucket')
        .reply(204, {});
    }

    client.destroyContainer(container, function(err) {
      if (!mock) {
        return done(err);
      }

      hockInstance && hockInstance.done();
      server.close(done);
    });
  });

  describe('containers', function () {
    it('creates a container', function () {
      assert.assertContainer(container);
    });

    it('gets all containers', function(done) {
      if (mock) {
        hockInstance
          .get('/storage/v1/b?project=test-project')
          .replyWithFile(200, __dirname + '/../../fixtures/google/get-buckets.json');
      }

      client.getContainers(function(err, containers) {
        assert.ifError(err);

        containers.forEach(assert.assertContainer);

        hockInstance && hockInstance.done();
        done();
      });
    });

    it('gets a container', function (done) {
      if (mock) {
        hockInstance
          .get('/storage/v1/b/' + CONTAINER_NAME)
          .replyWithFile(200, __dirname + '/../../fixtures/google/get-bucket.json');
      }

      client.getContainer(CONTAINER_NAME, function(err, container) {
        assert.ifError(err);

        assert.assertContainer(container);
        assert.equal(container.name, CONTAINER_NAME);

        hockInstance && hockInstance.done();
        done();
      });
    });
  });

  describe('files', function () {
    var file,
      packageJson = JSON.parse(fs.readFileSync('./package.json'));

    before(function (done) {
      fs.createReadStream('./package.json')
        .pipe(client.upload({
          container: container,
          file: 'package.json'
        }))
        .on('error', done)
        .on('success', function(f) {
          file = f;
          done();
        });
    });

    after(function (done) {
      if (mock) {
        hockInstance
          .delete('/storage/v1/b/test-bucket/o/package.json')
          .reply(204, {});
      }

      client.removeFile(container, file, function(err) {
        hockInstance && hockInstance.done();
        done(err || null);
      });
    });

    it('creates a file', function() {
      assert.assertFile(file);
    });

    it('downloads a file', function(done) {
      var buffer = new Buffer('');

      if (mock) {
        hockInstance
          .get('/storage/v1/b/test-bucket/o/package.json')
          .reply(200, { mediaLink: 'http://localhost:12345/mediaLink' });
      }

      client.download({
          container: container,
          file: file
        })
        .on('error', done)
        .on('data', function(chunk) {
          buffer = Buffer.concat([buffer, chunk]);
        })
        .on('end', function() {
          assert.deepEqual(JSON.parse(buffer), packageJson);

          hockInstance && hockInstance.done();
          done();
        });
    });

    it('gets all files', function(done) {
      if (mock) {
        hockInstance
          .get('/storage/v1/b/test-bucket/o')
          .replyWithFile(200, __dirname + '/../../fixtures/google/get-files.json');
      }

      client.getFiles(container, function(err, files) {
        assert.ifError(err);

        files.forEach(assert.assertFile);

        hockInstance && hockInstance.done();
        done();
      });
    });

    it('gets a file', function(done) {
      if (mock) {
        hockInstance
          .get('/storage/v1/b/test-bucket/o/package.json')
          .replyWithFile(200, __dirname + '/../../fixtures/google/get-file.json');
      }

      client.getFile(container, FILE_NAME, function(err, file) {
        assert.ifError(err);

        assert.assertFile(file);
        assert.equal(file.name, FILE_NAME);

        hockInstance && hockInstance.done();
        done();
      });
    });
  });
});