//TODO: Make this a vows test

var helpers = require('../../helpers');

var client = helpers.createClient('azure', 'storage');

client.removeFile('pkgcloud-test-container', 'test-file.txt', function (err, res) {
  if (err) {
    console.dir(err);
  } else {
    console.dir(res);
  }
});

