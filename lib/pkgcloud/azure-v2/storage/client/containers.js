/*
 * containers.js: Instance methods for working with containers from Azure
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var StorageManagementClient = require('azure-arm-storage');
var azureStorage = require('azure-storage');

var constants = require('../../constants');

/**
 * list a collection of storage accounts under a resource group
 * @param {function} callback
 */
function getContainers(callback) {
  var self = this;
  
  self.login(err => {

    if (err) {
      return callback(err);
    }

    var storageClient = new StorageManagementClient(self.azure.credentials, self.config.subscriptionId);
    storageClient.storageAccounts.listByResourceGroup(self.config.resourceGroup, (err, results) => {
      return err
        ? callback(err)
        : callback(null, results.map(res => new self.models.Container(self, res)));
    });
  });
}

/**
 * Responds with the azure stoarge account with the given name
 * @param {string|storage.Container} container - container name of container configuration
 * @param {function} callback - Continuation to respond to when complete.
 */
function getContainer(container, callback) {
  var self = this;
  var containerName = container instanceof self.models.Container ? container.name : container;

  self.login(err => {

    if (err) {
      return callback(err);
    }

    var storageClient = new StorageManagementClient(self.azure.credentials, self.config.subscriptionId);
    storageClient.storageAccounts.getProperties(self.config.resourceGroup, containerName, (err, result) => {
      return err
        ? callback(err)
        : callback(null, new self.models.Container(self, result));
    });
  });
}

/**
 * Create a new storage account
 * @param {string|object} options - container name of container configuration
 * @param {string} options.name - storage account name
 * @param {string} options.type - storage account type
 * @param {function} callback - Continuation to respond to when complete.
 * 
 * From Azure docs:
 * A container that was recently deleted cannot be recreated until all of
 * its blobs are deleted. Depending on how much data was stored within the container,
 * complete deletion can take seconds or minutes. If you try to create a container
 * of the same name during this cleanup period, your call returns an error immediately.
 */
function createContainer(options, callback) {
  var self = this;
  var containerName = options instanceof self.models.Container ? options.name : options;
  var parameters = typeof options == 'string' ? { name: options } : options;

  self.deploy('storage', parameters, (err) => {
    return err ?
      callback(err) :
      self.getContainer(containerName, callback);
  });
}

/**
 * Destroy a new storage account
 * @param {string|storage.Container} container - container name of container configuration
 * @param {function} callback - Continuation to respond to when complete.
 * 
 * From Azure docs:
 * A container that was recently deleted cannot be recreated until all of
 * its blobs are deleted. Depending on how much data was stored within the container,
 * complete deletion can take seconds or minutes. If you try to create a container
 * of the same name during this cleanup period, your call returns an error immediately.
 */
function destroyContainer(container, callback) {
  var self = this;
  var containerName = container instanceof self.models.Container ? container.name : container;

    self.login(err => {

    if (err) {
      return callback(err);
    }

    var storageClient = new StorageManagementClient(self.azure.credentials, self.config.subscriptionId);
    storageClient.storageAccounts.deleteMethod(self.config.resourceGroup, containerName, callback);
  });
}

function listContainerKeys(container, callback) {
  var self = this;
  var containerName = container instanceof self.models.Container ? container.name : container;

  self.login(err => {

    if (err) {
      return callback(err);
    }

    var storageClient = new StorageManagementClient(self.azure.credentials, self.config.subscriptionId);
    storageClient.storageAccounts.listKeys(self.config.resourceGroup, containerName, (err, result) => {
      return err
        ? callback(err)
        : callback(null, result);
    });
  });
}

function getContainerKey (container, callback) {
  var self = this;
  var containerName = container instanceof self.models.Container ? container.name : container;
  
  self.azure = self.azure || {};
  self.azure.storageKeys = self.azure.storageKeys || {};

  if (self.azure.storageKeys[containerName]) {
    return callback(null, self.azure.storageKeys[containerName]);
  }

  self.listContainerKeys(container, (err, result) => {
    if (err) {
      return callback(err);
    }

    var key = result.keys[0].value;
    self.azure.storageKeys[containerName] = key;
    return callback(null, key);
  });
}

function getBlobService(options, storageAccountName, callback) {
  var self = this;
  options = options || {};
  var azureContainer = typeof options == 'string' ? options : (options.container || constants.DEFAULT_STORAGE_CONTAINER);

  self.getContainerKey(storageAccountName, (err, containerKey) => {
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
}


module.exports = {
  getBlobService,
  getContainers,
  getContainer,
  createContainer,
  destroyContainer,
  listContainerKeys,
  getContainerKey
};