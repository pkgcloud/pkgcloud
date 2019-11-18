var pkgcloud = require('../../lib/pkgcloud');

// 1 -- Access Azure Storage Account with storage account key
var client = pkgcloud.storage.createClient({
  provider: 'azure',
  storageAccount: 'test-storage-account',     // Name of your storage account
  storageAccessKey: 'test-storage-access-key' // Access key for storage account
});

client.getContainers(function (err, containers) {
  if (err) {
    console.error(err);
  }

  containers.forEach(function (container) {
    console.log(container.toJSON());
  });
});

// 2 -- Access Azure Storage Account with Shared Access Signature
client = pkgcloud.storage.createClient({
  provider: 'azure',
  storageAccount: 'test-storage-account',     // Name of your storage account
  sasToken: 'shared access signature' // Shared Access Signature for storage account
});

client.getFiles('container', function (err, files) {
  if (err) {
    console.error(err);
    console.error(err.result.err);    
  }

  files.forEach(function (file) {
    console.log(file.toJSON());
  });
});