var pkgcloud = require('../../lib/pkgcloud');

var azure = pkgcloud.compute.createClient({
  provider: 'azure',
  storageAccount: 'test-storage-account',      // Name of your storage account
  storageAccessKey: 'test-storage-access-key', // Access key for storage account
  managementCertificate: './test/fixtures/azure/cert/management/management.pem',
  subscriptionId: "azure-account-subscription-id",
  azure: {
    location: 'East US',     // Azure location for server
    username: 'pkgcloud',    // Username for server
    password: 'Pkgcloud!!',  // Password for server
    //
    // SSH settings for linux server
    //
    ssh: {
      port: 22, // default is 22
      pem: "./test/fixtures/azure/cert/ssh/mycert.pem",
      pemPassword: ""
    },
    //
    // RDP settings for windows server
    //
    rdp: {
      port: 3389
    }
  }
});
