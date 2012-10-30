var Container = require('../../../lib/pkgcloud/azure/storage/container');

var testUrl = 'http://pkgcloudtest.blob.core.windows.net/vhd/create-test-ids2.vhd';

Container.getStorageInfoFromUri(testUrl, function(err, info) {
  if(err) {
    console.dir(err);
  } else {
    console.dir(info);
  }
});