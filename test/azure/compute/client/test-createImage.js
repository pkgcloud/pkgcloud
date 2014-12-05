//TODO: Make this a vows test

var helpers = require('../../../helpers');

var client = helpers.createClient('azure', 'compute');

var options = {
  name: 'pkgcloud1',
  server: 'pkgcloud1'
};

client.createImage(options, function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.dir(result);
  }
});

