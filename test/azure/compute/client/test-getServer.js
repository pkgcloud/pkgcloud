//TODO: Make this a vows test

var helpers = require('../../../helpers');

var client = helpers.createClient('azure', 'compute');

client.getServer('pkgcloud2', function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.dir(result);
  }
});




