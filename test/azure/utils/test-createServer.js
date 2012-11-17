//TODO: Make this a vows test

var Client = new require('../../../lib/pkgcloud/core/base/client').Client;
var helpers = require('../../helpers');
var azureApi = require('../../../lib/pkgcloud/azure/utils/azureApi');
var client = helpers.createClient('azure', 'compute');

var options = {
  name: 'pkgcloud7',
  flavor: 'Small',
  image: 'OpenLogic__OpenLogic-CentOS-62-20120531-en-us-30GB.vhd'
};

azureApi.createServer(client, options, function(err, result) {
  if(err) {
    console.log(err);
  } else {
    console.dir(result);
  }
});




