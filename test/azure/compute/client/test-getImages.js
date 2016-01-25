//TODO: Make this a vows test

var helpers = require('../../../helpers');

var client = helpers.createClient('azure', 'compute');

/*
client.getImages(options, function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.dir(result);
  }
});
*/

client.getImage('SUSE__SUSE-Linux-Enterprise-Server-11SP2-20120601-en-us-30GB.vhd', function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.dir(result);
  }
});




