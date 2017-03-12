/*
 * servers.js: Instance methods for working with servers from Azure Cloud
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */
var async = require('async');
var errs = require('errs');

var resourceManagement = require('azure-arm-resource');
var ComputeManagementClient = require('azure-arm-compute');

var constants = require('../../constants');

/**
 * Gets the current API version
 * @param {function} callback cb(err, version).
 */
function getVersion(callback) {
  callback(null, constants.MANAGEMENT_API_VERSION);
}

/**
 * Gets the current API limits
 * @param {function} callback - cb(err, version).
 */
function getLimits(callback) {
  return errs.handle(
    errs.create({
      message: 'Azure\'s API is not rate limited'
    }),
    callback
  );
}

/**
 * Lists all servers available to your account.
 * @param {function} callback - cb(err, servers). `servers` is an array that
 * represents the servers that are available to your account
 */
function getServers(callback) {
  var self = this;

  self.login(err => {

    if (err) {
      return callback(err);
    }

    var client = new ComputeManagementClient(self.azure.credentials, self.config.subscriptionId);
    client.virtualMachines.list(self.config.resourceGroup, (err, results) => {
      return err ?
        callback(err) :
        callback(null, results.map(res => new self.models.Server(self, res)));
    });
  });
}

/**
 * Gets a server in Azure.
 * @param {Server|String} server Server id or a server
 * @param {Function} callback cb(err, serverId).
 */
function getServer(server, hostname, callback) {
  var self = this;
  var serverId = server instanceof self.models.Server ? server.name : server;

  if (typeof hostname === 'function' && typeof callback === 'undefined') {
    callback = hostname;
    hostname = null;
  }

  self.login(err => {

    if (err) {
      return callback(err);
    }

    var client = new ComputeManagementClient(self.azure.credentials, self.config.subscriptionId);

    // This will ensure returning of instances running status
    var options = {
      expand: 'instanceView'
    };
    client.virtualMachines.get(self.config.resourceGroup, serverId, options, (err, result) => {

      if (err) {
        return callback(err);
      }

      // Get public dns url
      if (!result.networkProfile ||
        !result.networkProfile.networkInterfaces ||
        !result.networkProfile.networkInterfaces.length) {
        return callback(null, new self.models.Server(self, result));
      }

      var networkInterfaceId = result.networkProfile.networkInterfaces[0].id;
      var resourceClient = new resourceManagement.ResourceManagementClient(self.azure.credentials, self.config.subscriptionId);

      resourceClient.resources.getById(networkInterfaceId, constants.DEFAULT_API_VERSION, (err, networkInterface) => {

        if (err) {
          return callback(err);
        }

        if (!networkInterface.properties.ipConfigurations ||
          !networkInterface.properties.ipConfigurations.length ||
          !networkInterface.properties.ipConfigurations[0] ||
          !networkInterface.properties.ipConfigurations[0].properties ||
          !networkInterface.properties.ipConfigurations[0].properties.publicIPAddress ||
          !networkInterface.properties.ipConfigurations[0].properties.publicIPAddress.id) {
          return callback(null, new self.models.Server(self, result));
        }

        var publicIPID = networkInterface.properties.ipConfigurations[0].properties.publicIPAddress.id;
        resourceClient.resources.getById(publicIPID, constants.DEFAULT_API_VERSION, (err, publicIP) => {
          if (err) {
            return callback(err);
          }

          if (!publicIP.properties.dnsSettings || !publicIP.properties.dnsSettings.fqdn) {
            return callback(null, new self.models.Server(self, result));
          }

          result = result || {};
          result.hostname = publicIP.properties.dnsSettings.fqdn;

          return callback(null, new self.models.Server(self, result));
        });
      });
    });
  });
}

/**
 * Creates a server with the specified options
 * 
 * @description The flavor
 * properties of the options can be instances of Flavor
 * OR ids to those entities in Azure.
 * 
 * @param {object}   options - **Optional** options
 * @param {string}   options.name - **Optional** the name of server
 * @param {function} callback cb(err, server).
 */
function createServer(options, callback) {
  var self = this;

  if (!options.name || !options.username || !options.password) {
    return errs.handle(
      errs.create({
        message: 'Please provide a name for the vm, as well as the username and password for login'
      }),
      callback
    );
  }

  if (!options.flavor) {
    return errs.handle(
      errs.create({
        message: 'When creating an azure server a flavor or an image need to be supplied'
      }),
      callback
    );
  }

  var templateName = 'compute' + (options.imageSourceUri ? '-from-image' : '');
  self.deploy(templateName, options, (err, result) => {

    if (err) {
      return callback(err);
    }

    var hostname = null;
    var location = null;
    var vmID = null;
    if (result &&
      result.properties &&
      result.properties.outputs &&
      result.properties.outputs.hostname &&
      result.properties.outputs.hostname.value &&
      result.properties.outputs.location &&
      result.properties.outputs.location.value &&
      result.properties.outputs.vmID &&
      result.properties.outputs.vmID.value) {
      hostname = result.properties.outputs.hostname.value;
      location = result.properties.outputs.location.value;
      vmID = result.properties.outputs.vmID.value;
    } else {
      return callback(new Error('Result was not in the correct format: ' + JSON.stringify(result || {})));
    }

    if (options.osType === 'Windows') {
      var hostnameSuffix = hostname.substring(hostname.indexOf('.') + 1);
      var extensionId = vmID + "/extensions/WinRMCustomScriptExtension";
      var resourceClient = new resourceManagement.ResourceManagementClient(self.azure.credentials, self.config.subscriptionId);
      return resourceClient.resources.createOrUpdateById(
        extensionId,
        constants.DEFAULT_API_VERSION, {
          "location": location,
          "properties": {
            "publisher": "Microsoft.Compute",
            "typeHandlerVersion": "1.8",
            "type": "CustomScriptExtension",
            "settings": {
              "fileUris": ["https://pluginsstorage.blob.core.windows.net/agentscripts/ssh.ps1"],
              "commandToExecute": `powershell -File ssh.ps1 ${hostname}\\${options.username} ${options.password}`
            },
            "protectedSettings": {
              "storageAccountName": 'pluginsstorage',
              "storageAccountKey": 'bHabDjY34dXwITjXEasmQxI84QinJqiBZHiU+Vc1dqLNSKQxvFrZbVsfDshPriIB+XIaFVaQ2R3ua1YMDYYfHw=='
            },
          }
        },
        (err, result) => {
          return err ?
            callback(err) :
            self.getServer(options.name, hostname, callback);
        }
      );
    } else { // Linux
      var extensionId = vmID + "/extensions/LinuxCustomScriptExtension";
      var resourceClient = new resourceManagement.ResourceManagementClient(self.azure.credentials, self.config.subscriptionId);
      return resourceClient.resources.createOrUpdateById(
        extensionId,
        constants.DEFAULT_API_VERSION, {
          "location": location,
          "properties": {
            "publisher": "Microsoft.OSTCExtensions",
            "typeHandlerVersion": "1.5",
            "type": "CustomScriptForLinux",
            "settings": {
              "fileUris": [
                "https://pluginsstorage.blob.core.windows.net/agentscripts/sudo.sh"
              ],
              "commandToExecute": 'bash sudo.sh ' + options.username
            },
            "protectedSettings": {
              "storageAccountName": 'pluginsstorage',
              "storageAccountKey": 'bHabDjY34dXwITjXEasmQxI84QinJqiBZHiU+Vc1dqLNSKQxvFrZbVsfDshPriIB+XIaFVaQ2R3ua1YMDYYfHw=='
            },
          }
        },
        (err, result) => {
          return err ?
            callback(err) :
            self.getServer(options.name, hostname, callback);
        }
      );
    }

    return err ?
      callback(err) :
      self.getServer(options.name, hostname, callback);
  });
}

/**
 * Destroy a server in Azure.
 * @param {Server|string} server Server id or a server
 * @param {object} options optional | options for deletion
 * @param {boolean} options.destroyNics should destroy nics also
 * @param {boolean} options.destroyPublicIP should destroy public ip also
 * @param {boolean} options.destroyVnet should destroy vnet also
 * @param {boolean} options.destroyStorage should destroy storage account also
 * @param {function} callback cb(err, serverId).
 */
function destroyServer(server, options, callback) {
  var self = this;
  var serverId = server && server.name || server;

  if (typeof options === 'function' && typeof callback === 'undefined') {
    callback = options;
    options = {};
  }

  options = options || {};

  var resourceClient;
  var serverDetails;
  var nicsIds;
  var nicsDetails;

  var vnets;
  var publicIPs;

  async.waterfall([
    (next) => {
      self.login(next);
    },
    (credentials, next) => {
      self.getServer(serverId, next);
    },
    (_server, next) => {
      serverDetails = _server;
      next();
    },
    (next) => {
      // Deleting the vm
      resourceClient = new resourceManagement.ResourceManagementClient(self.azure.credentials, self.config.subscriptionId);
      var client = new ComputeManagementClient(self.azure.credentials, self.config.subscriptionId);
      client.virtualMachines.deleteMethod(self.config.resourceGroup, serverId, next);
    }
  ], (err) => {

    if (err) {
      return callback(err);
    }

    if (!options.destroyNics &&
      !options.destroyPublicIP &&
      !options.destroyVnet &&
      !options.destroyStorage) {
      return callback();
    }

    async.waterfall([
      (next) => {
        // Deleting the nics
        nicsIds = serverDetails &&
          serverDetails.azure &&
          serverDetails.azure.networkProfile &&
          serverDetails.azure.networkProfile.networkInterfaces || [];

        // Go over all nics, get their details and go on to delete them
        async.eachSeries(nicsIds, (nic, cb) => {

          nicsDetails = [];
          async.waterfall([
            (nx) => {
              resourceClient.resources.getById(nic.id, constants.MANAGEMENT_API_VERSION, nx);
            },
            (nicDetails, request, response, nx) => {
              nicsDetails.push(nicDetails);

              if (options.destroyNics) {
                resourceClient.resources.deleteById(nic.id, constants.MANAGEMENT_API_VERSION, nx);
              }
            }
          ], cb);

        }, next);
      },
      (next) => {
        // Collecting public ips and vnet ids
        publicIPs = [];
        vnets = [];
        nicsDetails.forEach((nic) => {

          var configs = nic && nic.properties && nic.properties.ipConfigurations || [];

          // Collecting 
          configs.forEach((config) => {
            var props = config && config.properties || {};
            if (props.publicIPAddress && props.publicIPAddress.id) {
              publicIPs.push(props.publicIPAddress.id);
            }

            if (props.subnet && props.subnet.id && props.subnet.id.indexOf('/subnets/') >= 0) {
              vnets.push(props.subnet.id.substr(0, props.subnet.id.indexOf('/subnets/')));
            }
          });

        });
        next();
      },
      (next) => {

        if (!options.destroyPublicIP) {
          return next();
        }

        // Deleting public ips
        async.eachSeries(publicIPs, (publicIP, cb) => {
          resourceClient.resources.deleteById(publicIP, constants.MANAGEMENT_API_VERSION, cb);
        }, next);
      },
      (next) => {

        if (!options.destroyVnet) {
          return next();
        }

        // Deleting vnets
        async.eachSeries(vnets, (vnet, cb) => {
          resourceClient.resources.deleteById(vnet, constants.MANAGEMENT_API_VERSION, cb);
        }, next);
      },
      (next) => {
        // Deleting storage account
        if (!options.destroyStorage) {
          return next();
        }

        var storageUri = serverDetails &&
          serverDetails.azure &&
          serverDetails.azure.storageProfile &&
          serverDetails.azure.storageProfile.osDisk &&
          serverDetails.azure.storageProfile.osDisk.vhd &&
          serverDetails.azure.storageProfile.osDisk.vhd.uri || null;

        if (!storageUri || !storageUri.startsWith('https://')) {
          return next();
        }

        var storageName = storageUri.substr('https://'.length);
        storageName = storageName.substr(0, storageName.indexOf('.'));

        // Presuming the storage account is in the same resource group as the vm
        resourceClient.resources.deleteMethod(
          self.config.resourceGroup,
          'Microsoft.Storage',
          'storageAccounts',
          storageName,
          '', '2016-01-01', next);
      }
    ], callback);
  });

}

/**
 * Stop a server in Azure.
 * @param {Server|string} server Server id or a server
 * @param {function} callback cb(err, serverId).
 */
function stopServer(server, callback) {
  var self = this;
  var serverId = server instanceof self.models.Server ? server.id : server;

  self.login(err => {

    if (err) {
      return callback(err);
    }

    var client = new ComputeManagementClient(self.azure.credentials, self.config.subscriptionId);
    client.virtualMachines.powerOff(self.config.resourceGroup, serverId, (err) => {
      return err ?
        callback(err) :
        callback(null, serverId);
    });
  });
}

/**
 * Restart a server in Azure.
 * @param {Server|string} server Server id or a server
 * @param {function} callback cb(err, serverId).
 */
function rebootServer(server, callback) {
  var self = this;
  var serverId = server instanceof self.models.Server ? server.id : server;

  self.login(err => {

    if (err) {
      return callback(err);
    }

    var client = new ComputeManagementClient(self.azure.credentials, self.config.subscriptionId);
    client.virtualMachines.restart(self.config.resourceGroup, serverId, (err) => {
      return err ?
        callback(err) :
        callback(null, serverId);
    });
  });
}

/**
 * Rename a server in Azure.
 * @param {Server|string} server Server id or a server
 * @param {function} callback cb(err, serverId).
 */
function renameServer(server, callback) {
  return errs.handle(
    errs.create({
      message: 'Not supported by Azure.'
    }),
    callback
  );
}

module.exports = {
  getVersion,
  getLimits,
  getServers,
  getServer,
  createServer,
  destroyServer,
  stopServer,
  rebootServer,
  renameServer
};