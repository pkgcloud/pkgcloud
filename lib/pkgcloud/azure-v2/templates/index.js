var path = require('path');
var fs = require("fs");
var async = require('async');

var resourceManagement = require('azure-arm-resource');

var azureApi = require('../utils/azureApi');

function resolve(templateId) {
  var templatePath = path.join(__dirname, '..', 'templates', 'arm-' + templateId + '.json');
  var contents = fs.readFileSync(templatePath);
  return JSON.parse(contents);
}

function deploy(client, templateName, options, callback) {

  async.waterfall([
    (next) => {
      azureApi.login(client, next);
    },
    (credentials, next) => {
      var template = resolve(templateName);
      var parameters = {
        properties: {
          template: template,
          parameters: {},
          mode: 'Incremental'
        }
      };
      Object.keys(options).forEach(key => parameters.properties.parameters[key] = { value: options[key] });

      var deploymentName = 'pkgc-' + (new Date()).toISOString().replace(/\:|Z|\.|\-/g, '').replace(/T/g, '-');
      var resourceClient = new resourceManagement.ResourceManagementClient(credentials, client.config.subscriptionId);
      resourceClient.deployments.createOrUpdate(client.config.resourceGroup, deploymentName, parameters, (err, result) => {
        return err
          ? next(err)
          : next(null, result);
      });
    }
  ], callback);
}

module.exports = {
  resolve,
  deploy
}