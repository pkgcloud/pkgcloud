//TODO: Make this a vows test
var azureCert = require('../../../lib/pkgcloud/azure/utils/cert.js');

azureCert.getAzureCert('../../fixtures/azure/cert/management/management.pem', function (err, result) {
  if (err) {
    console.dir(err);
  } else {
    console.dir(result);
  }
});

