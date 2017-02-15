var errs = require('errs');

var msRestAzure = require('ms-rest-azure');
var resourceManagement = require('azure-arm-resource');

var templates = require('./templates');
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

  var self = this;
  if (typeof setupLocation == 'function' && typeof callback === 'undefined') {
    callback = setupLocation;
    setupLocation = null;
  }

  // Make sure credentials are refreshed by intervals
  if (self.azure && self.azure.credentials && self.azure.lastRefresh) {
    var now = new Date();
    if (now - self.azure.lastRefresh < constants.CREDENTIALS_LIFESPAN) {
      return callback(null, self.azure.credentials);
    }
  }

  var config = self.config;
  var servicePrincipal = config.servicePrincipal;
  msRestAzure.loginWithServicePrincipalSecret(
    servicePrincipal.clientId, 
    servicePrincipal.secret, 
    servicePrincipal.domain, 
    function (err, credentials) {

      if (err) {
        errs.handle(
          errs.create({
              message: 'There was a problem connecting to azure: ' + err
          }),
          callback
        );
      }

      self.azure = self.azure || {};
      self.azure.credentials = credentials;
      self.azure.lastRefresh = new Date();

      if (setupLocation) {
        return self.setup(credentials, function (err) { 
          return callback(err, credentials); 
        });
      } else {
        return callback(null, credentials);
      }
    });
}

/**
 * Setting up an azure session including querying the default location from the resource group
 * used by the current configuration
 * @param {object} credentials object containing azure credentials
 * @param {requestCallback} callback to respond to when complete.
 */
function setupLocation(credentials, callback) {
  var self = this;

  self.azure = self.azure || {};
  self.azure.location = self.azure.location || self.config.location;
  if (self.azure.location) {
    return callback();
  }

  if (self.config.resourceGroup) {
    var resourceClient = new resourceManagement.ResourceManagementClient(credentials, self.config.subscriptionId);
    resourceClient.resourceGroups.get(self.config.resourceGroup, function (err, result) {

      if (err) {
        return callback(err);
      }

      self.azure.location = result.location;
      return callback();
    });
  }
}

/**
 * Binding common methods to be available to all clients
 * @param {object} credentials object containing azure credentials
 * @param {requestCallback} callback to respond to when complete.
 */
function bind(client) {
  client.login = login.bind(client);
  client.setupLocation = setupLocation.bind(client);
  client.deploy = templates.deploy.bind(client);
}

module.exports = {
  bind
};