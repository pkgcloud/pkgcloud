var pkgcloud = require('../../lib/pkgcloud');
var client;
var options;

//
// Create a pkgcloud compute instance
//
options = {
  resourceGroup: '{resourceGroup}',
  provider: 'azure-v2',
  storageAccount: '{storeName}',
  storageAccessKey: '{storeKey}',
  subscriptionId: '{subscriptionId}',
  spClientId: '{spClientId}',
  spSecret: '{spSecret}',
  spDomain: '{spDomain}',
  spSubscriptionId: '{spSubscriptionId}'
};
client = pkgcloud.compute.createClient(options);

//
// Create a server.
// This may take several minutes.
//
options = {
  // pkgcloud compute properties
  name:  'ms-pkgc-vm-test',   // name of the server
  flavor: 'Standard_D1',     // azure vm size
  //image: '5112500ae3b842c8b9c604889f8753c3__OpenLogic-CentOS63DEC20121220', // OS Image to use
  image: {
    uri: 'https://{storename}.blob.core.windows.net/osdiks/ms-pkgc-test-os2.vhd',
    OS: 'linux'
  },
  nic: '/subscriptions/{subscriptionId}/resourceGroups/{resourceGroup}/providers/Microsoft.Network/networkInterfaces/{nicName}',

  // Azure vm properties
  location:  'West Europe',       // Azure location for server
  username:  'pkgcloud',      // Username for server
  password:  'Pkgcloud!!'    // Password for server
};

console.log('creating server...');

client.createServer(options, function (err, server) {
  if (err) {
    console.log(err);
  } else {
    // Wait for the server to reach the RUNNING state.
    // This may take several minutes.
    console.log('waiting for server RUNNING state...');
    server.setWait({ status: server.STATUS.running }, 10000, function (err, server) {
      if (err) {
        console.log(err);
      } else {
        console.dir(server);
      }
    });
  }
});
