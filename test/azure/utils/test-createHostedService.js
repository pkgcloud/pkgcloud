//TODO: Make this a vows test

var Client = new require('../../../lib/pkgcloud/core/base/client').Client;
var helpers = require('../../helpers');
var azureApi = require('../../../lib/pkgcloud/azure/utils/azureApi');
var client = helpers.createClient('azure', 'compute');

var options = {};

azureApi.createHostedService(client, 'pkgcloud4', function(err, result) {
  if(err) {
    console.log(err);
  } else {
    console.dir(result);
  }
});




