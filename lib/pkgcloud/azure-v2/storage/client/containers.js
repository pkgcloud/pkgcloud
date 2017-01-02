/*
 * containers.js: Instance methods for working with containers from Azure
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var async = require('async');
var StorageManagementClient = require('azure-arm-storage');

var base = require('../../../core/storage');
var pkgcloud = require('../../../../../lib/pkgcloud');
var templates = require('../../templates');
var azureApi = require('../../utils/azureApi');
var constants = require('../../utils/constants');

var storage = pkgcloud.providers['azure-v2'].storage;

/**
 * list a collection of storage accounts under a resource group
 * @param {function} callback
 */
function getContainers(callback) {
  var client = this;
  
  async.waterfall([
    (next) => {
      azureApi.login(client, next);
    },
    (credentials, next) => {
      var storageClient = new StorageManagementClient(credentials, client.config.subscriptionId);
      storageClient.storageAccounts.listByResourceGroup(client.config.resourceGroup, (err, results) => {
        return err
          ? next(err)
          : next(null, results.map(res => new (storage.Container)(client, res)));
      });
    }
  ], callback);
};

/**
 * Responds with the azure stoarge account with the given name
 * @param {string|storage.Container} container - container name of container configuration
 * @param {function} callback - Continuation to respond to when complete.
 */
function getContainer(container, callback) {
  var containerName = container instanceof storage.Container ? container.name : container;
  var client = this;

  async.waterfall([
    (next) => {
      azureApi.login(client, next);
    },
    (credentials, next) => {
      var storageClient = new StorageManagementClient(credentials, client.config.subscriptionId);
      storageClient.storageAccounts.getProperties(client.config.resourceGroup, containerName, (err, result) => {
        return err
          ? next(err)
          : next(null, new (storage.Container)(client, result));
      });
    }
  ], callback);
};

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
  var containerName = options instanceof base.Container ? options.name : options;
  var parameters = typeof options == 'string' ? { name: options } : options;

  templates.deploy(self, 'storage', options, (err, result) => {
    return err ?
      callback(err) :
      self.getContainer(containerName, callback);
  })
};

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
  var containerName = container instanceof base.Container ? container.name : container;
  var client = this;

  async.waterfall([
    (next) => {
      azureApi.login(client, next);
    },
    (credentials, next) => {
      var storageClient = new StorageManagementClient(credentials, client.config.subscriptionId);
      storageClient.storageAccounts.deleteMethod(client.config.resourceGroup, containerName, next);
    }
  ], callback);
};

function listContainerKeys(container, callback) {
  var containerName = container instanceof storage.Container ? container.name : container;
  var client = this;

  async.waterfall([
    (next) => {
      azureApi.login(client, next);
    },
    (credentials, next) => {
      var storageClient = new StorageManagementClient(credentials, client.config.subscriptionId);
      storageClient.storageAccounts.listKeys(client.config.resourceGroup, containerName, (err, result) => {
        return err
          ? next(err)
          : next(null, result);
      });
    }
  ], callback);
}

function getContainerKey (container, callback) {
  var containerName = container instanceof this.models.Container ? container.name : container;
  var client = this;
  
  client.azure = client.azure || {};
  client.azure.storageKeys = client.azure.storageKeys || {};

  if (client.azure.storageKeys[containerName]) {
    return callback(null, client.azure.storageKeys[containerName]);
  }

  client.listContainerKeys(container, (err, result) => {
    if (err) {
      return callback(err);
    }

    var key = result.keys[0].value;
    client.azure.storageKeys[containerName] = key;
    return callback(null, key);
  });
}

module.exports = {
  getContainers,
  getContainer,
  createContainer,
  destroyContainer,
  listContainerKeys,
  getContainerKey
}