/*
 * personality-test.js: tests cloudserver's ability to add files
 *                      to a server's filesystem during creationg
 *
 * (C) 2010 Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    vows = require('vows'),
    nock = require('nock'),
    assert = require('../../helpers/assert'),
    pkgcloud = require('../../../lib/pkgcloud'),
    helpers = require('../../helpers');
    
var keyBuffer = fs.readFileSync(__dirname + '/../../fixtures/testkey.pub'),
    client = helpers.createClient('rackspace', 'compute'),
    testData = {}, 
    testServer;

if (process.env.NOCK) {
  return console.log('Sorry this test cant be mocked since it uses ssh');
}

vows.describe('pkgcloud/rackspace/compute/personality').addBatch({
  "The pkgcloud Rackspace compute client": {
    "the create() method": {
      "with an SSH key in the personality": {
        topic: function () {
          client.createServer({
            name: 'create-personality-test',
            image: 49, // Ubuntu Lucid
            flavor: 1, // 256 server
            personality : [{
              path     : "/root/.ssh/authorized_keys",
              contents : keyBuffer.toString('base64')
            }]
          }, this.callback);
        },
        "should return a valid server": function (server) {
          testServer = server;
          assert.assertServerDetails(server);
        }
      }
    }
  }
}).addBatch({
  "connect via ssh" : {
    topic: function () {
      var that = this,
          data = '';
          
      testServer.setWait({ status: 'RUNNING' }, 5000, function () {
        var ssh  = spawn('ssh', [
          '-i',
          __dirname + '/../../fixtures/testkey',
          '-q',
          '-o',
          'StrictHostKeyChecking no',
          'root@' + testServer.addresses["public"][0],
          'cat /root/.ssh/authorized_keys'
        ]);
        
        function onError(err) {
          console.log(err);
        }
        
        ssh.stderr.on('error', onError);
        ssh.stderr.on('data', function (chunk) {});
        ssh.stdout.on('error', onError);
        ssh.stdout.on('data', function (chunk) {
          data += chunk;
        });
        
        ssh.on('error', onError);
        ssh.on('exit', function () {
          that.callback(null, data);
        });
      });
    },
    "should connect without a password prompt": function (err, output) {
      assert.equal(output, keyBuffer.toString());
    }
  }
}).addBatch({
  "the destroy() method with the second server": {
    topic: function () {
      var that = this;
      testServer.setWait({ status: 'ACTIVE' }, 5000, function () {
        testServer.destroy(that.callback);
      });
    },
    "should respond with 202": function (err, res) {
      assert.equal(res.statusCode, 202); 
    }
  } 
})["export"](module);