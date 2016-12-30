var async = require('async');
var errs = require('errs');
var _ = require('lodash');

var msRestAzure = require('ms-rest-azure');
var resourceManagement = require("azure-arm-resource");

var constants = require('./constants');
var templates = require('./templates');

/**
 * This callback type is called `requestCallback` and is displayed as a global symbol.
 *
 * @callback requestCallback
 * @param {object} error
 * @param {object} result
 */

/**
 * Request and save credentials for accessing azure ARM resources.
 * @param {object} client object containing configuration.
 * @param {requestCallback} callback to respond to when complete.
 */
function login(client, callback) {

  // Make sure credentials are refreshed by intervals
  if (client.azure && client.azure.credentials && client.azure.lastRefresh) {
    var now = new Date();
    if (now - client.azure.lastRefresh < constants.CREDENTIALS_LIFESPAN) {
      return callback(null, client.azure.credentials);
    }
  }

  var config = client.config;
  var servicePrincipal = config.servicePrincipal;
  msRestAzure.loginWithServicePrincipalSecret(
    servicePrincipal.clientId, 
    servicePrincipal.secret, 
    servicePrincipal.domain, 
    (err, credentials) => {

      if (err) {
          errs.handle(
            errs.create({
                message: 'There was a problem connecting to azure: ' + err
            }),
            callback
          );
        }

        client.azure = client.azure || {};
        client.azure.credentials = credentials;
        client.azure.lastRefresh = new Date();

        return callback(null, credentials);
    });
}

function setup(client, callback) {
  login(client, (err, credentials) => {
    
    if (err) {
      return callback(err);
    }

    client.azure = client.azure || {};
    client.azure.location = client.azure.location || client.config.location;
    if (client.azure.location) {
      return callback();
    }

    if (client.config.resourceGroup) {
      var resourceClient = new resourceManagement.ResourceManagementClient(credentials, client.config.subscriptionId);
      resourceClient.resourceGroups.get(client.config.resourceGroup, (err, result) => {

        if (err) {
          return callback(err);
        }

        client.azure.location = result.location;
        return callback();
      });
    }
  });
}

/**
 * list all resources inside a resource group
 * @param {object} client
 * @param {object} provider
 * @param {string} provider.namespace
 * @param {string} provider.resourceType
 * @param {requestCallback} callback - callback with results
 */
function list(client, provider, callback) {
  var client = this;
  var config = client.config;

  async.waterfall([
    function (next) {
      azureApi.login(client, next);
    },
    function (credentials, next) {

      var resourceClient = new resourceManagement.ResourceManagementClient(client.credentials, config.subscriptionId);
      resourceClient.resourceGroups.listResources(
        config.resourceGroup,
        {
          filter: `resourceType eq '${provider.namespace}/${provider.resourceType}'`
        },
        function(err, result, request, response) {
          if (err) {
            return errs.handle(errs.create('A problem during resource creation: ' + err), callback);
          }

          callback(null, result);
        }
      );
    }
  ], callback);
}

/**
 * list all resources inside a resource group
 * @param {object} client
 * @param {string} id
 * @param {object} provider
 * @param {string} provider.namespace
 * @param {string} provider.resourceType
 * @param {requestCallback} callback - callback with results
 */
function getById(client, provider, id, callback) {
  var config = client.config;

  login(client, (err, credentials) => {

    if (err) {
      return errs.handle(errs.create('A problem gettinh resource: ' + err), callback);
    }

    var resourceClient = new resourceManagement.ResourceManagementClient(credentials, config.subscriptionId);
    resourceClient.resources.get(
      config.resourceGroup,
      provider.namespace, provider.resourceType, 
      id, '', 
      constants.DEFAULT_API_VERSION, 
      (err, result, request, response) => {
        if (err) {
          return errs.handle(errs.create('A problem during resource creation: ' + err), callback);
        }

        callback(null, result);
      }
    );
  });

}

function create(client, provider, id, parameters, callback) {
  var config = client.config;

  var _params = null;
  async.waterfall([
    (next) => {
      templates.resolve('storage', {}, next);
    },
    (params, next) => {
      _params = params;
      login(client, next);
    },
    (credentials, next) => {

      var resourceClient = new resourceManagement.ResourceManagementClient(credentials, config.subscriptionId);
      resourceClient.resources.createOrUpdate(
        config.resourceGroup,
        provider.namespace, provider.resourceType, 
        id, '',
        constants.DEFAULT_API_VERSION, 
        _params,
        (err, result, request, response) => {
          if (err) {
            return errs.handle(errs.create('A problem during resource creation: ' + err), callback);
          }

          callback(null, result);
        }
      );
    }
  ], callback);
}

module.exports = {
  login,
  setup,
  list,
  getById,
  create
}