var async = require('async');
var _ = require('lodash');
var errs = require('errs');

var msRestAzure = require('ms-rest-azure');
var resourceManagement = require("azure-arm-resource");

var template = require('./templates');

/**
 * createServer()
 *
 * In order to deploy a vm, Azure requires us to do the following
 * before we can actually try to create the vm.
 * 1. Login
 * 2. resolve the OSImage url to a container on the user's account
 * 3. upload SSH certificate (if necessary)
 * 4. create the VM
 *
 * Note: creating a VM on Azure will fail if one of the following is true
 * 1. The VM (with the same name) already exists
 * 2. The blob storage (with the same name) for the OSImage already exists
 * 3. The VM disk (with the same name) for the OSImage already exists
 * 4. The storage account is in a different azure location than the vm
 *    (East US, West US...)
 *
 * Note: createServer() must wait for Azure to respond if the createDeployment (vm)
 * request succeeded. createServer() asynchronously polls Azure to get
 * the result. Once the result is received, the callback function will be called
 * with the server information or error. The state of returned server will most likely
 * be PROVISIONING or STOPPED. Use server.setWait() to continue polling the server until
 * its status is RUNNING. This entire process may take several minutes.
 */
exports.createServer = function(client, options, callback) {

    var vmOptions = {};

    // async execute the following tasks one by one and bail if there is an error
    async.waterfall([
            function(next) {
                validateCreateOptions(options, client.config, next);
            },
            function(next) {
      loginToAzure(client, next);
            },
            function(next) {
                createVM(client, options, vmOptions, next);
            },
            function(server, next) {
                // now get the actual server info
                getServer(client, options, server, next);
            }
        ],
        function(err, result) {
            if (err) {
                callback(err);
            } else {
                // return the server info
                callback(null, result);
            }
        }
    );
}

/**
 * loginToAzure
 * In order to perform any ARM action on azure, we first need to authenticate using user name and password.
 * https://www.npmjs.com/package/ms-rest-azure
 */
var loginToAzure = function (client, callback) {
    var config = client.config;
    msRestAzure.loginWithServicePrincipalSecret(config.spClientId, config.spSecret, config.spDomain, function(err, credentials) {

        if (err) {
            errs.handle(
                errs.create({
                    message: 'There was a problem connecting to azure: ' + err
                }),
                callback
            );
        }

        client.credentials = credentials;

        return callback();
    });
}

var validateCreateOptions = function(options, config, callback) {
    if (typeof options === 'function') {
        options = {};
    }
    options = options || {}; // no args

    // check required options values
    ['flavor', 'image', 'name', 'username', 'password', 'location'].forEach(function(member) {
        if (!options[member]) {
            errs.handle(
                errs.create({
                    message: 'options.' + member + ' is a required argument.'
                }),
                callback
            );
        }
    });
    callback();
};

var createVM = function(client, options, vmOptions, callback) {
    // check OS type of image to determine if we are creating a linux or windows VM
    switch (options.image.OS.toLowerCase()) {
        case 'linux':
            createLinuxVM(client, options, vmOptions, callback);
            break;
        case 'windows':
            createWindowsVM(client, options, vmOptions, callback);
            break;
        default:
            callback(errs.create({
                message: 'Unknown Image OS: ' + options.image.OS
            }));
            break;
    }
};

var createLinuxVM = function(client, options, vmOptions, callback) {

    var configParams = {
        API_VERSION: '2016-03-30',
        NAME: options.name,
        USERNAME: options.username,
        PASSWORD: options.password,
        VM_SIZE: options.flavor,
        LOCATION: options.location,
        VM_NAME: options.name,
        OS_DISK_URI: options.image.uri,
        NICK_ID: options.nic
    };

    makeTemplateRequest(client, 'vm', configParams, callback);
};

var createWindowsVM = function(client, options, vmOptions, callback) {
    var path = client.subscriptionId + '/services/hostedservices/' + options.name + '/deployments';
    var mediaLink = getMediaLinkUrl(client.config.storageAccount, options.name + '.vhd');
    var label = new Buffer(options.name).toString('base64');

    var configParams = {
        NAME: options.name,
        COMPUTER_NAME: options.computerName || options.name.slice(0, 15),
        LABEL_BASE64: label,
        PASSWORD: options.password,
        ROLESIZE: options.flavor,
        ENDPOINTS: createEndpoints(options.ports),
        OS_SOURCE_IMAGE_NAME: vmOptions.image.Name,
        OS_IMAGE_MEDIALINK: mediaLink
    };

    makeTemplateRequest(client, path, 'windowsDeployment.xml', configParams, callback);
};

exports.getServer = function(client, name, callback) {

    var configParams = {
        API_VERSION: '2016-03-30',
        NAME: name,
        USERNAME: '',
        PASSWORD: '',
        VM_SIZE: '',
        LOCATION: '',
        VM_NAME: '',
        OS_DISK_URI: '',
        NICK_ID: ''
    };

  async.waterfall([
    function (next) {
      loginToAzure(client, next);
    },
    function (next) {
      template.resolve('vm', configParams, function (err, identity, parameters) {

        var config = client.config;
        var resourceClient = new resourceManagement.ResourceManagementClient(client.credentials, config.subscriptionId);
        resourceClient.resources.get(
          config.resourceGroup, 
          identity.resourceProviderNamespace, identity.resourceType,
          identity.resourceName, 
          'InstanceView', 
          identity.resourceProviderApiVersion, null, 
          function (err, result, request, response) {
            if (err) {
              errs.handle(
                errs.create('A problem during resource creation: ' + err),
                callback
              );
            }

            var jsonResult = JSON.parse(response.body);
            jsonResult.name = name;
            next(null, jsonResult);
          }
        );

      });
    }],
    function (err, result) {
      if (err) {
        callback(err);
      } else {
        // return the server info
        callback(null, result);
      }
    }
  );
}

getServer = function(client, options, server, callback) {

    var configParams = {
        API_VERSION: '2016-03-30',
        NAME: options.name,
        USERNAME: options.username,
        PASSWORD: options.password,
        VM_SIZE: options.flavor,
        LOCATION: options.location,
        VM_NAME: options.name,
        OS_DISK_URI: options.image.uri,
        NICK_ID: options.nic
    };

    template.resolve('vm', configParams, function(err, identity, parameters) {
        var config = client.config;
        var resourceClient = new resourceManagement.ResourceManagementClient(client.credentials, config.subscriptionId);
        resourceClient.resources.get(
            config.resourceGroup,
            identity.resourceProviderNamespace, identity.resourceType,
            identity.resourceName,
            'InstanceView',
            identity.resourceProviderApiVersion, null,
            function(err, result, request, response) {
                if (err) {
                    errs.handle(
                        errs.create('A problem during resource creation: ' + err),
                        callback
                    );
                }

                var jsonResult = JSON.parse(response.body);
                jsonResult = _.extend(jsonResult, server);
                callback(null, jsonResult);
            }
        );
    });
};

makeTemplateRequest = function(client, templateName, params, callback) {

    template.resolve(templateName, params, function(err, identity, parameters) {

        var config = client.config;
        var resourceClient = new resourceManagement.ResourceManagementClient(client.credentials, config.subscriptionId);
        resourceClient.resources.beginCreateOrUpdate(
            config.resourceGroup,
            identity.resourceProviderNamespace, '',
            identity.resourceType,
            identity.resourceName,
            identity.resourceProviderApiVersion,
            parameters, null,
            function(err, result, request, response) {
                if (err) {
                    errs.handle(
                        errs.create('A problem during resource creation: ' + err),
                        callback
                    );
                }

                callback(null, result);
            }
        );
    });
};

var deleteServer = function(client, serverName, callback) {
    var configParams = {
        API_VERSION: '2016-03-30',
        NAME: serverName,
        USERNAME: ',',
        PASSWORD: '',
        VM_SIZE: '',
        LOCATION: '',
        VM_NAME: '',
        OS_DISK_URI: '',
        NICK_ID: ''
    };

    template.resolve('vm', configParams, function(err, identity, parameters) {

        var config = client.config;
        var resourceClient = new resourceManagement.ResourceManagementClient(client.credentials, config.subscriptionId);
        resourceClient.resources.beginDeleteMethod(
            config.resourceGroup,
            identity.resourceProviderNamespace, '',
            identity.resourceType,
            identity.resourceName,
            identity.resourceProviderApiVersion,
            parameters,
            function(err, result, request, response) {
                if (err) {
                    errs.handle(
                        errs.create('A problem during resource deletion: ' + err),
                        callback
                    );
                }
                callback();
            }
        );
    });
};

exports.destroyServer = function(client, serverName, callback) {
    var server = null;

    async.waterfall([
            function(next) {
                loginToAzure(client, {}, next);
            },
            function(next) {
                deleteServer(client, serverName, next);
            }
        ],
        function(err) {
            callback(err, true);
        }
    );
};
