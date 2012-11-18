//TODO: Make this a vows test
var fs = require('fs');
var azureCert = require('../../../lib/pkgcloud/azure/utils/cert.js');


// load azure config file (you need to set this up with your azure account info)
var config = JSON.parse(fs.readFileSync("../configs/azure.json",'utf8'));


azureCert.getAzureCert('../../fixtures/azure/cert/management/management.pem', function(err, result) {
  if(err) {
    console.dir(err);
  } else {
    console.dir(result);
  }
});

