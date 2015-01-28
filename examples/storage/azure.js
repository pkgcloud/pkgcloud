var pkgcloud = require('../../lib/pkgcloud');

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