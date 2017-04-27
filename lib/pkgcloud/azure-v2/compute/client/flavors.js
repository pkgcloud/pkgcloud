/*
 * flavors.js: Implementation of Azure Flavors Client.
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var _ = require('lodash');
var ComputeManagementClient = require('azure-arm-compute');

/**
 * Lists all flavors available to your account.
 * @param {function} callback - cb(err, flavors). `flavors` is an array that
 * represents the flavors that are available to your account
 */
function getFlavors(callback) {
  var self = this;

  self.login(true, function (err) {

    if (err) {
      return callback(err);
    }

    var client = new ComputeManagementClient(self.azure.credentials, self.config.subscriptionId);
    client.virtualMachineSizes.list(self.azure.location, function (err, results) {
      return err
        ? callback(err)
        : callback(null, results.map(function (res) {
            return new self.models.Flavor(self, res);
          }));
    });
  });
}

/**
 * Gets a specified flavor of AWS DataSets using the provided details object.
 * @param {Flavor|String} image - Flavor ID or an Flavor
 * @param {function} callback cb(err, flavor). `flavor` is an object that
 * represents the flavor that was retrieved.
 */
function getFlavor(flavor, callback) {
  var self = this;
  var flavorId = flavor instanceof self.models.Flavor ? flavor.id : flavor;

  if (flavor instanceof self.models.Flavor) {
    return callback(null, flavor);
  }

  self.getFlavors(function (err, flavors) {
    return err ?
      callback(err) :
      callback(null, _.find(flavors, { id: flavorId }));
  });
}

module.exports = {
  getFlavors: getFlavors,
  getFlavor: getFlavor
};