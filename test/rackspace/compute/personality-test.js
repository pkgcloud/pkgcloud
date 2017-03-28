/*
* personality-test.js: tests cloudserver's ability to add files
*                      to a server's filesystem during creationg
*
* (C) 2010 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
* MIT LICENSE
*
*/

var fs = require('fs'),
    spawn = require('child_process').spawn,
    should = require('should'),
    helpers = require('../../helpers'),
    mock = !!process.env.MOCK;

describe('pkgcloud/rackspace/compute/personality', function () {
  var keyBuffer = fs.readFileSync(__dirname + '/../../fixtures/testkey.pub'),
      client = helpers.createClient('rackspace', 'compute'),
      testServer;

  if (mock) {
    describe.skip('Skipping pkgcloud rackspace compute personality tests (mocked)', function() {});
    return;
  }

  describe('The pkgcloud Rackspace Compute client', function () {
    it('the create() method with an SSH key in the personality should return a valid server', function(done) {
      client.createServer({
        name: 'create-personality-test',
        image: 49, // Ubuntu Lucid
        flavor: 1, // 256 server
        personality: [
          {
            path: '/root/.ssh/authorized_keys',
            contents: keyBuffer.toString('base64')
          }
        ]
      }, function(err, server) {
        should.not.exist(err);
        should.exist(server);
        testServer = server;
        done();
      });
    });

    it('should connect over ssh without a password prompt and validate the key', function(done) {

      var data, errorData;

      testServer.setWait({ status: testServer.STATUS.running }, 5000, function () {
        var ssh = spawn('ssh', [
          '-i',
          __dirname + '/../../fixtures/testkey',
          '-q',
          '-o',
          'StrictHostKeyChecking no',
          'root@' + testServer.addresses['public'][0],
          'cat /root/.ssh/authorized_keys'
        ]);

        function onError(err) {
          console.log(err);
        }

        ssh.stderr.on('error', onError);
        ssh.stderr.on('data', function (chunk) {
          errorData += chunk;
        });
        ssh.stdout.on('error', onError);
        ssh.stdout.on('data', function (chunk) {
          data += chunk;
        });

        ssh.on('error', onError);
        ssh.on('exit', function () {
          should.exist(data);
          done();
        });
      });
    });

    after(function(done) {
      testServer.destroy(function(err, res) {
        should.not.exist(err);
        should.exist(res);
        res.statusCode.should.equal(202);
        done();
      });
    });
  });
});
