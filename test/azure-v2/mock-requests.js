var path = require('path');
var nock = require('nock');
var helpers = require('../helpers');

const azureAuthUri = 'https://login.microsoftonline.com';
const azureManagementUri = 'https://management.azure.com';
const requestId = 'b67cc525-ecc5-4661-8fd6-fb3e57d724f5';
const apiVersion = '2016-03-30';

function loadFixture(name) {
  return helpers.loadFixture(path.join('azure-v2', name));
}

function prepare() {

  var config = helpers.loadConfig('azure-v2');
  var sp = config.servicePrincipal;


  // Nock authentication requests
  nock(`${azureAuthUri}`)
    .post(`/${sp.domain}/oauth2/token?api-version=1.0`)
    .reply(200, loadFixture('authentication-certificate.json'));

  // Subscriptions
  nock(`${azureManagementUri}`)
    .get('/subscriptions?api-version=2015-11-01')
    .reply(200, loadFixture('subscriptions.json'));

  // Servers
  nock(`${azureManagementUri}/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}/providers/Microsoft.Compute`)
    .get(`/virtualMachines?api-version=${apiVersion}`)
    .reply(200, loadFixture('servers.json'))
    .get(`/virtualMachines/azure-vm-server?$expand=instanceView&api-version=${apiVersion}`)
    .reply(200, loadFixture('server.json'))
    .delete(`/virtualMachines/azure-vm-server?api-version=${apiVersion}`)
    .reply(204, '');

  // Nicks
  //https://management.azure.com//subscriptions/subscriptionId/resourceGroups/resource-group/providers/Microsoft.Network/networkInterfaces/nicName?api-version=2016-03-30
  nock(`${azureManagementUri}/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}/providers/Microsoft.Network`)
    .get(`/networkInterfaces/nicName?api-version=${apiVersion}`)
    .reply(200, loadFixture('nic.json'))
    .delete(`/networkInterfaces/nicName?api-version=${apiVersion}`)
    .reply(204, '');

  // Public IPs
  nock(`${azureManagementUri}/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}/providers/Microsoft.Network`)
    .delete(`/publicIPAddresses/publicIPName?api-version=${apiVersion}`)
    .reply(204, '');

  // VNET
  nock(`${azureManagementUri}/subscriptions/${config.subscriptionId}/resourceGroups/${config.resourceGroup}/providers/Microsoft.Network`)
    .delete(`/virtualNetworks/vnetName?api-version=${apiVersion}`)
    .reply(204, '');

  // Storage
  // https://management.azure.com/subscriptions/azure-account-subscription-id/resourceGroups/resource-group/providers/Microsoft.Storage/storageAccounts/test-storage?api-version=2016-05-01
  nock(`${azureManagementUri}/subscriptions/${config.subscriptionId}/resourcegroups/${config.resourceGroup}/providers/microsoft.storage`)
    .filteringPath((path) => { return path.toLowerCase(); })
    .get(`/storageaccounts/azurestorage?api-version=2016-05-01`)
    .reply(200, loadFixture('container.json'))
    .post(`/storageaccounts/azurestorage/listkeys?api-version=2016-05-01`)
    .reply(200, loadFixture('container-keys.json'))
    .delete(`/storageaccounts/azurestorage/?api-version=2016-01-01`)
    .reply(204, '');

  // url:"https://management.azure.com/subscriptions/73a4ea93-d914-424d-9e64-28adf397e8e3/resourceGroups/morshe-noobaa2/providers/Microsoft.Storage/storageAccounts/boobaavmstore3/listKeys?api-version=2016-05-01"

  // Deployments
  nock(`${azureManagementUri}/subscriptions/${config.subscriptionId}/resourcegroups/${config.resourceGroup}/providers/microsoft.resources/deployments`)
    .filteringPath((path) => { 
      path = path.toLowerCase()
      return path.substr(0, path.indexOf('/deployments/pkgc-')) + '/deployments/pkgc-test'; 
    })
    .put('/pkgc-test')
    .reply(200, {});
}

module.exports = {
  prepare
};