var azure = require('azure');

var subscriptionId = '409efed7-eabe-45ea-adec-a92dfc9cddfc';

var auth = {
  keyfile: '/Users/stammen/.azure/managementCertificate.pem',
  certfile: '/Users/stammen/.azure/managementCertificate.pem'
};

var hostOptions = {
  host: 'management.core.windows.net',
  apiversion: '2012-03-01',
  serializetype: 'XML'
};


// listHostedServices. Check if service exists
// add vm to service or create service
// get proper url for OS
//



var sm = azure.createServiceManagementService(subscriptionId,auth,hostOptions);

/*
// list locations
sm.listLocations(function(error, result) {
  if(!error && result.body) {
    result.body.map(function (location) {
      console.log(location.Name);
    });
  }
});

// list images
sm.listOSImage(function(error, result) {
  if(!error && result.body) {
    result.body.map(function (image) {
      console.dir(image);
    });
  }
});


sm.listDisks(function(error, result) {

  if(!error && result.body) {
    result.body.map(function (data) {
      console.dir(data);
    });
  }
});


sm.listHostedServices(function(error, result) {

  if(!error && result.body) {
    result.body.map(function (data) {
      console.dir(data);
    });
  }
});
*/
sm.getOSImage('CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd', function(err, res) {
  if(err) {
    callback(err)
  } else {
    callback(null,image = new compute.Image(self, res.body),res );
  }
});





