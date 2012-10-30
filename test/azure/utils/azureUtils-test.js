var azureUtils = require('../../../lib/pkgcloud/azure/utils/azureUtils');

var testUrl = 'http://pkgcloudtest.blob.core.windows.net/vhd/create-test-ids2.vhd';

azureUtils.getStorageInfoFromUri(testUrl, function(err, info) {
  if(err) {
    console.dir(err);
  } else {
    console.dir(info);
  }
});