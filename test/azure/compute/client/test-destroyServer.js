//TODO: Make this a vows test

var Client = new require('../../../../lib/pkgcloud/core/base/client').Client;
var helpers = require('../../../helpers');
var pkgcloud = require('../../../../lib/pkgcloud');

var client = helpers.createClient('azure', 'compute');

client.destroyServer('test-reboot', function(err, result) {
  if(err) {
    console.log(err);
  } else {
    console.log('ok');
  }
});




