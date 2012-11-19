var pkgcloud = require('../../lib/pkgcloud');

var azure = pkgcloud.storage.createClient({
  provider: 'azure',
  storageAccount: "test-storage-account",			  // Name of your storage account
  storageAccountKey: "test-storage-account-key"	// Access key for storage account
});