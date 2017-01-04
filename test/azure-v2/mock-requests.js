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
}

module.exports = {
  prepare
};