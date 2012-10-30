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


var getDeployment = function(name, next) {

  var sm = azure.createServiceManagementService(subscriptionId, auth, hostOptions),
    self = this;

  sm.getDeployment(name, name, function(err, result) {
    if(err) {
      console.log(err);
    } else {
      console.dir(result.body.RoleInstanceList);
      console.dir(result.body.RoleList);
    }
  });
};

getDeployment('create-test-ids2')