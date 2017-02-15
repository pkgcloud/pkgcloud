/*
 * servers.js: Instance methods for working with servers from Azure Cloud
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */
var async = require('async');
var errs = require('errs');
var _ = require('lodash');

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
    errs.create({ message: 'Azure\'s API is not rate limited' }),
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
      return err
        ? callback(err)
        : callback(null, results.map(res => new self.models.Server(self, res)));
    });
  });
}

/**
 * Gets a server in Azure.
 * @param {Server|String} server Server id or a server
 * @param {Function} callback cb(err, serverId).
 */
function getServer(server, callback) {
  var self     = this;
  var serverId = server instanceof self.models.Server ? server.name : server;

  self.login(err => {

    if (err) {
      return callback(err);
    }

    var client = new ComputeManagementClient(self.azure.credentials, self.config.subscriptionId);
    
    // This will ensure returning of instances running status
    var options = { expand: 'instanceView' };
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
      errs.create({ message: 'Please provide a name for the vm, as well as the username and password for login' }),
      callback
    );
  }

  if (!options.flavor) {
    return errs.handle(
      errs.create({ message: 'When creating an azure server a flavor or an image need to be supplied' }),
      callback
    );
  }

  var adjustVMTemplate = function (template) {

    var vmIndex = _.findIndex(template.resources, { 'type': 'Microsoft.Compute/virtualMachines' });

    // Adding additional data disks
    if (options.storageDataDiskNames && options.storageDataDiskNames.length) {
      options.storageDataDiskNames.forEach(function (ddName, idx) {
        template.resources[vmIndex].properties.storageProfile.dataDisks.push({
          'name': 'datadisk' + idx.toString(),
          'diskSizeGB': '100',
          'lun': 0,
          'vhd': {
            'uri': '[concat(reference(concat(\'Microsoft.Storage/storageAccounts/\', variables(\'storageAccountName\')), \'2016-01-01\').primaryEndpoints.blob, parameters(\'storageContainerName\'),\'/\', \'' + ddName + '\', \'.vhd\')]'
          },
          'createOption': 'Empty'
        });
      });
    }

    // If this is a windows machine, add an extension that enables remote connection via WinRM
    if (options.osType === 'Windows') {
      template.resources[vmIndex].resources = [{
        'type': 'Microsoft.Compute/virtualMachines/extensions',
        'name': '[concat(variables(\'vmName\'),\'/WinRMCustomScriptExtension\')]',
        'apiVersion': constants.DEFAULT_API_VERSION,
        'location': '[resourceGroup().location]',
        'dependsOn': [
          '[concat(\'Microsoft.Compute/virtualMachines/\', variables(\'vmName\'))]'
        ],
        'properties': {
          'publisher': 'Microsoft.Compute',
          'type': 'CustomScriptExtension',
          'typeHandlerVersion': '1.4',
          'settings': {
            'fileUris': [
              'https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/201-vm-winrm-windows/ConfigureWinRM.ps1',
              'https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/201-vm-winrm-windows/makecert.exe',
              'https://raw.githubusercontent.com/Azure/azure-quickstart-templates/master/201-vm-winrm-windows/winrmconf.cmd'
            ],
            'commandToExecute': '[concat(\'powershell -ExecutionPolicy Unrestricted -file ConfigureWinRM.ps1 \',variables(\'hostDNSNameScriptArgument\'))]'
          }
        }
      }];
    }

    return template;
  };

  var templateName = 'compute' + (options.imageSourceUri ? '-from-image' : '');
  self.deploy(templateName, options, adjustVMTemplate, function (err) {
    return err ?
      callback(err) :
      self.getServer(options.name, callback);
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
    ], function (error) {
      callback(error, serverDetails);
    });
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
      return err
        ? callback(err)
        : callback(null, serverId);
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
      return err
        ? callback(err)
        : callback(null, serverId);
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
    errs.create({ message: 'Not supported by Azure.' }),
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
