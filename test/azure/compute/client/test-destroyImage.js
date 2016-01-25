//TODO: Make this a vows test

var helpers = require('../../../helpers');

var client = helpers.createClient('azure', 'compute');

client.destroyImage('pkgcloud1', function (err, result) {
  if (err) {
    console.dir(err);
  } else {
    console.dir(result);
  }
});

