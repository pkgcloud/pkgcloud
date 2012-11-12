//TODO: Make this a vows test
var fs = require('fs');
var azureCert = require('../../../lib/pkgcloud/azure/utils/cert.js');


// load azure config file
var config = JSON.parse(fs.readFileSync("../configs/azure.json",'utf8'));

var path = '/Users/stammen/dev/microsoft/cert/myCert.pem';

azureCert.getAzureCert('/Users/stammen/dev/microsoft/cert/myCert.pem', function(err, result) {
  if(err) {
    console.dir(err);
  } else {
    console.dir(result);
  }
});

