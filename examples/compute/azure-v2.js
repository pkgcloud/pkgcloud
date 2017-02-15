var pkgcloud = require('../../lib/pkgcloud');
var client;
var options;

//
// Create a pkgcloud compute instance
//
options = {
  provider: 'azure-v2',
  subscriptionId: '{subscriptionId}',  
  resourceGroup: '{resourceGroup}',

  servicePrincipal: {
    clientId: '{spClientId}',
    secret: '{spSecret}',
    domain: '{spDomain}'
  }
};
client = pkgcloud.compute.createClient(options);

//
// Create a server.
// This may take several minutes.
//
var createVMOfferOptions = {
  name:  'ms-pkgc-vm-test',
  flavor: 'Standard_D1',
  username:  'pkgcloud',
  password:  'Pkgcloud!!',

  storageOSDiskName: 'osdisk',
  storageDataDiskNames: [ 'datadisk1' ],

  imagePublisher: 'Canonical',
  imageOffer: 'UbuntuServer',
  imageSku: '16.04.0-LTS',
  imageVersion: 'latest'
};

console.log('creating server...');

client.createServer(createVMOfferOptions, function (err, server) {

  console.log('servre created successfully:');
  console.dir(server);

  if (err) {
    console.log(err);
  } else {
    client.destroyServer(createVMOfferOptions, { 
      destroyNics: true,
      destroyPublicIP: true,
      destroyVnet: true, 
      destroyStorage: true 
    }, (err, server) => {
      if (err) {
        console.log(err);
      } else {
        console.log('deleted successfully');
        console.dir(server);
      }
    });
  }
});
