//TODO: Make this a vows test

var helpers = require('../../helpers');

var client = helpers.createClient('azure', 'storage');

var options = {
  container: 'pkgcloud-test-container',
  remote: 'test-file.txt'
};

var stream = client.download(options, function (err, res) {
  if (err) {
    console.dir(err);
  } else {
    console.dir(res);
  }
});

stream.on('data', function (data) {
  console.log(data.toString());
});

