var errs = require('errs');

var msRestAzure = require('ms-rest-azure');
var resourceManagement = require("azure-arm-resource");

var constants = require('./constants');

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
 * @param {boolean} setupLocation Should setup a location from the resource group.
 * @param {requestCallback} callback to respond to when complete.
 */
function login(setupLocation, callback) {

  var client = this;
  if (typeof setupLocation == 'function' && typeof callback === 'undefined') {
    callback = setupLocation;
    setupLocation = null;
  }

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

      if (setupLocation) {
        return setup.call(client, credentials, err => callback(err, credentials))
      } else {
        return callback(null, credentials);
      }
    });
}

/**
 * Setting up an azure session including querying the default location from the resource group
 * used by the current configuration
 * @param {object} client object containing configuration.
 * @param {requestCallback} callback to respond to when complete.
 */
function setup(credentials, callback) {
  var client = this;

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
}

module.exports = {
  login
}