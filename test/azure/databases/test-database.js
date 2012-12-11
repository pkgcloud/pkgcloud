//TODO: Make this a vows test

var Client = new require('../../../lib/pkgcloud/core/base/client').Client;
var helpers = require('../../helpers');

var client = helpers.createClient('azure', 'database');

var options = {
  name: 'test3'
}

client.create(options, function(err, res) {
  if(err) {
    console.dir(err);
  } else {
    console.dir(res);
  }
});

