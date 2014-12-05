//TODO: Make this a vows test

var helpers = require('../../helpers');
var azureApi = require('../../../lib/pkgcloud/azure/utils/azureApi');
var client = helpers.createClient('azure', 'compute');

azureApi.getOSImage(client, 'OpenLogic__OpenLogic-CentOS-62-20120531-en-us-30GB.vhd', function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.dir(result);
  }
});




