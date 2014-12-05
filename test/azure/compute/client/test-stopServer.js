//TODO: Make this a vows test

var helpers = require('../../../helpers');

var client = helpers.createClient('azure', 'compute');

var options = {};

client.stopServer('pkgcloud1', function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.dir(result);
  }
});




