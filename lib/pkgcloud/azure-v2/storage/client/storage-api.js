
var async = require('async');
var azureStorage = require('azure-storage');

var azureApi = require('../../utils/azureApi');
var constants = require('../../utils/constants');

function getBlobService(client, options, storageAccountName, callback) {

  options = options || {};
  var azureContainer = typeof options == 'string' ? options : (options.container || constants.DEFAULT_STORAGE_CONTAINER);

  client.getContainerKey(storageAccountName, (err, containerKey) => {
    if (err) {
      return callback(err);
    }

    var retryOperations = new azureStorage.ExponentialRetryPolicyFilter();
    var blobService = azureStorage.createBlobService(storageAccountName, containerKey).withFilter(retryOperations);
    blobService.createContainerIfNotExists(azureContainer, null, function(error) {
      return error ?
        callback(error) :
        callback(null, blobService);
    }); 
  });  
};


function listStorageAccountFiles(client, storageAccountName, options, callback) {
  
}

module.exports = {
  getBlobService,
  listStorageAccountFiles
}