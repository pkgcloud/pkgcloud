//TODO: Make this a vows test

var helpers = require('../../helpers');

var client = helpers.createClient('azure', 'database');

client.list(function (err, res) {
  if (err) {
    console.dir(err);
  } else {
    console.dir(res);
  }
});
