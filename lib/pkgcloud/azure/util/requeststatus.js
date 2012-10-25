var azure = require('azure');


var subscriptionId = '409efed7-eabe-45ea-adec-a92dfc9cddfc';
var username = "Nodejitsu";

var auth = {
  keyfile: '/Users/stammen/.azure/managementCertificate.pem',
  certfile: '/Users/stammen/.azure/managementCertificate.pem'
};

var hostOptions = {
  host: 'management.core.windows.net',
  apiversion: '2012-03-01',
  serializetype: 'XML'
};


var requestStatus = function(id, next) {

  var sm = azure.createServiceManagementService(subscriptionId, auth, hostOptions),
    self = this;

  sm.getOperationStatus(id, function(err, result) {
    if(err) {
      console.log(err);
    } else {
      console.dir(result);
    }
  });
};

requestStatus('f09f9e35cf4449cca0b090e36f04a08a')