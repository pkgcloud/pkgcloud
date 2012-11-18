//TODO: Make this a vows test

var Client = new require('../../../lib/pkgcloud/core/base/client').Client;
var helpers = require('../../helpers');
var fs = require('fs');
var async = require('async');

var client = helpers.createClient('azure', 'storage');

var options = {
  container: 'pkgcloud-test-container',
  remote: 'test-file.txt'
};


var stream = client.upload(options, function(err, res) {
  if(err) {
    console.dir(err);
  } else {
    console.dir(res);
  }
});

var file = fs.createReadStream(helpers.fixturePath('fillerama.txt'));
file.pipe(stream);

options.remote = 'bigfile.raw'
var stream2 = client.upload(options, function(err, res) {
  if(err) {
    console.dir(err);
  } else {
    console.dir(res);
  }
});

var file2 = fs.createReadStream(helpers.fixturePath('bigfile.raw'));
file2.pipe(stream2);


