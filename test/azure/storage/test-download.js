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




var stream = client.download(options, function(err, res) {
  if(err) {
    console.dir(err);
  } else {
    console.dir(res);
  }
});

stream.on('data', function(data) {
  console.log(data.toString());
});

