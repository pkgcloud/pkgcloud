var helpers = require('../../helpers'),
    async = require('async'),
    http = require('http'),
    hock = require('hock'),
    _ = require('lodash');

var authenticate = function (hockInstance) {
  hockInstance
    .post('/v2.0/tokens', {
      auth: {
        apiAccessKeyCredentials: {
          accessKey: 'MOCK-USERNAME',
          secretKey: 'MOCK-API-KEY'
        }
      }
    })
    .many()
    .reply(200, {
      access: {
        token: {
          expires: '2017-12-26T18:25:46Z',
          id: '4bc7c5dabf3e4a49918683437d386b8a',
          tenant: {
            enabled: true,
            id: '5ACED3DC3AA740ABAA41711243CC6949',
            name: 'MOCK-USERNAME',
            description: 'MOCK-USERNAME'
          }
        },
        serviceCatalog: [
          {
            endpoints: [
              {
                region: 'region-a.geo-1',
                tenantId: 'HPCloudFS_00aa00aa',
                publicURL: 'http://localhost:12345/v1/HPCloudFS_00aa00aa',
                internalURL: 'https://snet-storage101.ord1.clouddrive.com/v1/HPCloudFS_00aa00aa'
              }
            ],
            name: 'swift',
            type: 'object-store'
          }
        ],
        user: {
          username: 'MOCK-USERNAME',
          roles_links: [],
          id: 'bf3b85477d06430c8044d5b2e5e6dc5f',
          roles: [],
          name: 'MOCK-USERNAME'
        }
      }
    });
};

describe('pkgcloud/openstack/storage/', function () {

  describe('The openstack Storage client', function () {

    describe('copy', function () {
      var client, hockInstance, authHockInstance, server, authServer;

      beforeEach(function (done) {
        client = helpers.createClient('hp', 'storage');

        hockInstance = hock.createHock();
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

      afterEach(function (done) {
        async.parallel([
          function (next) {
            server.close(next);
          }, function (next) {
            authServer.close(next);
          }], done);
      });

      it('should copy within the same container', function (done) {
        authenticate(authHockInstance);
        hockInstance
          .head('/v1/HPCloudFS_00aa00aa/pkgcloud-test-container-1/pkgcloud-test-file-1?format=json')
          .replyWithFile(200, __dirname + '/../../fixtures/hp/getFile.json')
          .copy('/v1/HPCloudFS_00aa00aa/pkgcloud-test-container-1/pkgcloud-test-file-1', {}, {
            destination: '/pkgcloud-test-container-1/pkgcloud-test-file-2'
          })
          .reply(200);

        client.getFile('pkgcloud-test-container-1', 'pkgcloud-test-file-1', function (err, file) {
          if (err) {
            done(err);
          } else {
            file.copy({
              sourceContainer: 'pkgcloud-test-container-1',
              sourceFile: 'pkgcloud-test-file-1',
              destinationContainer: 'pkgcloud-test-container-1',
              destinationFile: 'pkgcloud-test-file-2'
            }, done);
          }
        });
      });

      it('should copy within the same container with container objects', function (done) {
        authenticate(authHockInstance);
        hockInstance
          .head('/v1/HPCloudFS_00aa00aa/pkgcloud-test-container-1')
          .reply(200)
          .head('/v1/HPCloudFS_00aa00aa/pkgcloud-test-container-1/pkgcloud-test-file-1?format=json')
          .replyWithFile(200, __dirname + '/../../fixtures/hp/getFile.json')
          .copy('/v1/HPCloudFS_00aa00aa/pkgcloud-test-container-1/pkgcloud-test-file-1', {}, {
            destination: '/pkgcloud-test-container-1/pkgcloud-test-file-2'
          })
          .reply(200);

        async.waterfall([
          _.bind(client.getContainer, client, 'pkgcloud-test-container-1'),
          function (container, next) {
            client.getFile(container, 'pkgcloud-test-file-1', function (err, file) {
              if (err) {
                done(err);
              } else {
                file.copy({
                  sourceContainer: container,
                  sourceFile: 'pkgcloud-test-file-1',
                  destinationContainer: container,
                  destinationFile: 'pkgcloud-test-file-2'
                }, next);
              }
            });
          }
        ], done);
      });

      it('should copy within the same container with headers', function (done) {
        authenticate(authHockInstance);
        hockInstance
          .head('/v1/HPCloudFS_00aa00aa/pkgcloud-test-container-1/pkgcloud-test-file-1?format=json')
          .replyWithFile(200, __dirname + '/../../fixtures/hp/getFile.json')
          .copy('/v1/HPCloudFS_00aa00aa/pkgcloud-test-container-1/pkgcloud-test-file-1', {}, {
            destination: '/pkgcloud-test-container-1/pkgcloud-test-file-2',
            'x-delete-after': '1209600'
          })
          .reply(200);

        client.getFile('pkgcloud-test-container-1', 'pkgcloud-test-file-1', function (err, file) {
          if (err) {
            done(err);
          } else {
            file.copy({
              sourceContainer: 'pkgcloud-test-container-1',
              sourceFile: 'pkgcloud-test-file-1',
              destinationContainer: 'pkgcloud-test-container-1',
              destinationFile: 'pkgcloud-test-file-2',
              headers: { 'x-delete-after': 1209600 }
            }, done);
          }
        });
      });

      it('should copy to a different container', function (done) {
        authenticate(authHockInstance);
        hockInstance
          .head('/v1/HPCloudFS_00aa00aa/pkgcloud-test-container-1/pkgcloud-test-file-1?format=json')
          .replyWithFile(200, __dirname + '/../../fixtures/hp/getFile.json')
          .copy('/v1/HPCloudFS_00aa00aa/pkgcloud-test-container-1/pkgcloud-test-file-1', {}, {
            destination: '/pkgcloud-test-container-2/pkgcloud-test-file-2'
          })
          .reply(200);

        client.getFile('pkgcloud-test-container-1', 'pkgcloud-test-file-1', function (err, file) {
          if (err) {
            done(err);
          } else {
            file.copy({
              sourceContainer: 'pkgcloud-test-container-1',
              sourceFile: 'pkgcloud-test-file-1',
              destinationContainer: 'pkgcloud-test-container-2',
              destinationFile: 'pkgcloud-test-file-2'
            }, done);
          }
        });
      });

      it('should copy to a different container defaulting to original file name', function (done) {
        authenticate(authHockInstance);
        hockInstance
          .head('/v1/HPCloudFS_00aa00aa/pkgcloud-test-container-1/pkgcloud-test-file-1?format=json')
          .replyWithFile(200, __dirname + '/../../fixtures/hp/getFile.json')
          .copy('/v1/HPCloudFS_00aa00aa/pkgcloud-test-container-1/pkgcloud-test-file-1', {}, {
            destination: '/pkgcloud-test-container-2/pkgcloud-test-file-1'
          })
          .reply(200);

        client.getFile('pkgcloud-test-container-1', 'pkgcloud-test-file-1', function (err, file) {
          if (err) {
            done(err);
          } else {
            file.copy({
              sourceContainer: 'pkgcloud-test-container-1',
              sourceFile: 'pkgcloud-test-file-1',
              destinationContainer: 'pkgcloud-test-container-2'
            }, done);
          }
        });
      });

      //testing all permutations of containers and source files as objects and strings
      _.each([
        { name: 'container-1', object: true },
        { name: 'container-1', object: false }
      ], function (srcContainer) {
        _.each([
          { name: 'container-2', object: true },
          { name: 'container-2', object: false }
        ], function (dstContainer) {
          _.each([
            { name: 'file-1', object: true },
            { name: 'file-1', object: false }
          ], function (srcFile) {

            var name = 'should copy from ';
            name += srcContainer.object ? 'object src container ' : 'string src container ';
            name += 'to ';
            name += dstContainer.object ? 'object dst container ' : 'string dst container ';
            name += 'with ';
            name += srcFile.object ? 'object src file' : 'string src file';

            it(name, function (done) {
              authenticate(authHockInstance);

              async.series({
                sourceContainer: function (next) {
                  if (srcContainer.object) {
                    hockInstance
                      .head('/v1/HPCloudFS_00aa00aa/' + srcContainer.name)
                      .reply(200);

                    client.getContainer(srcContainer.name, next);
                  } else {
                    next(null, srcContainer.name);
                  }
                },

                destinationContainer: function (next) {
                  if (dstContainer.object) {
                    hockInstance
                      .head('/v1/HPCloudFS_00aa00aa/' + dstContainer.name)
                      .reply(200);

                    client.getContainer(dstContainer.name, next);
                  } else {
                    next(null, dstContainer.name);
                  }
                }
              }, function (err, res) {
                if (err) {
                  done(err);
                } else {
                  hockInstance
                    .head('/v1/HPCloudFS_00aa00aa/' + srcContainer.name + '/' + srcFile.name + '?format=json')
                    .replyWithFile(200, __dirname + '/../../fixtures/hp/getFile.json')
                    .copy('/v1/HPCloudFS_00aa00aa/' + srcContainer.name + '/' + srcFile.name, {}, {
                      destination: '/' + dstContainer.name + '/' + srcFile.name
                    })
                    .reply(200);

                  client.getFile(srcContainer.name, srcFile.name, function (err, file) {
                    if (err) {
                      done(err);
                    } else {
                      file.copy({
                        sourceContainer: res.sourceContainer,
                        sourceFile: srcFile.object ? file : srcFile.name,
                        destinationContainer: res.destinationContainer
                      }, done);
                    }
                  });
                }
              });
            });
          });

        });
      });

    });

  });
});
