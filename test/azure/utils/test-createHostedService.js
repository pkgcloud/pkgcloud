//TODO: Make this a vows test

var helpers = require('../../helpers');
var azureApi = require('../../../lib/pkgcloud/azure/utils/azureApi');
var client = helpers.createClient('azure', 'compute');

azureApi.createHostedService(client, 'pkgcloud4', function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.dir(result);
  }
});




