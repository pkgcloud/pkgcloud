var helpers = require('../../helpers'),
  fs = require('fs'),
  assert = require('../../helpers/assert'),
  mock = !!process.env.MOCK;

describe('pkgcloud/google/storage', function () {
  var CONTAINER_NAME = 'pkgcloud-temp-container-' + Date.now(),
    container,
    client;

  before(function (done) {
    client = helpers.createClient('google', 'storage');

    client.createContainer(CONTAINER_NAME, function(err, c) {
      assert.ifError(err);
      container = c;
      done();
    });
  });

  after(function (done) {
    client.destroyContainer(container, done);
  });

  describe('containers', function () {
    it('creates a container', function () {
      assert.assertContainer(container);
    });

    it('gets all containers', function(done) {
      client.getContainers(function(err, containers) {
        assert.ifError(err);

        containers.forEach(assert.assertContainer);

        done();
      });
    });

    it('gets a container', function (done) {
      client.getContainer(CONTAINER_NAME, function(err, container) {
        assert.ifError(err);

        assert.assertContainer(container);
        assert.equal(container.name, CONTAINER_NAME);

        done();
      });
    });
  });

  describe('files', function () {
    var FILE_NAME = 'package.json',
      file,
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
      client.removeFile(container, file, done);
    });

    it('creates a file', function() {
      assert.assertFile(file);
    });

    it('downloads a file', function(done) {
      var buffer = new Buffer('');

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
          done();
        });
    });

    it('gets all files', function(done) {
      client.getFiles(container, function(err, files) {
        assert.ifError(err);

        files.forEach(assert.assertFile);

        done();
      });
    });

    it('gets a file', function(done) {
      client.getFile(container, FILE_NAME, function(err, file) {
        assert.ifError(err);

        assert.assertFile(file);
        assert.equal(file.name, FILE_NAME);

        done();
      });
    });
  });
});