var pkgcloud = require('../../lib/pkgcloud'),
  client,
  options;

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
  name:  'ms-pkgc-vm-test',   // name of the server
};

console.log('deleting server...');

client.destroyServer(options, function (err, server) {
  if (err) {
    console.log(err);
  } else {
    console.log('Started DELETE of VM: ', server);
  }
});
