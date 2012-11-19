//TODO: Make this a vows test

var Client = new require('../../../../lib/pkgcloud/core/base/client').Client;
var helpers = require('../../../helpers');
var pkgcloud = require('../../../../lib/pkgcloud');

var client = helpers.createClient('azure', 'compute');

var options = {
  name: 'pkgcloud2',
  flavor: 'Small',
  image: 'OpenLogic__OpenLogic-CentOS-62-20120531-en-us-30GB.vhd'
};

client.createServer(options, function(err, server) {
  if(err) {
    console.log(err);
  } else {
    server.setWait({ status: 'RUNNING' }, 5000, function (err, srv) {
       if(err) {
         console.log(err);
       } else {
         console.log(srv);
       }
     });
  }
});




