var HeaderConstants = require('./constants').HeaderConstants;
var async = require('async');
var templates = require('../compute/templates/templates');
var _ = require('underscore');
var errs = require('errs');
var URL = require('url');
var cert = require('../utils/cert');
var pkgcloud = require('../../../../../pkgcloud');
var Buffer = require('buffer').Buffer;

exports.MANAGEMENT_API_VERSION = '2012-03-01';
exports.STORAGE_API_VERSION = HeaderConstants.TARGET_STORAGE_VERSION;
var MINIMUM_POLL_INTERVAL = exports.MINIMUM_POLL_INTERVAL = 2000;

/*
 In order to deploy a vm, the azure-node-sdk requires us to do the following
 before we can call the SDK's createDeployment() method.
 1. get or create a Hosted Service
 2. resolve the OSImage url to a container on the user's account
 3. TODO: create the container if it does not exist
 4. now call Azure createDeployment().
 */

var createServer = exports.createServer = function(client, options, callback) {

  var vmOptions = {};

  // async execute the following tasks one by one and bail if there is an error
  async.waterfall([
    function(next) {
      // validate createServer options
      validateCreateOptions(options, client.config, next);
    },
    function(next) {
      getHostedServiceProperties(client, options.name, next);
    },
    function(service, next) {
      // if the HostedService does not exist, create it
      vmOptions.hostedService = service;
      if(vmOptions.hostedService === null) {
        createHostedService(client, options.name, function(err, service) {
          if(err) {
            next(err);
          } else {
            vmOptions.hostedService = service;
            next(null);
          }
        });
      } else {
        next(null);
      }
    },
    function(next) {
      // get the server's OSImage info
      getOSImage(client, options.image, function(err, res) {
        if(err) {
          next(err);
        } else {
          vmOptions.image = res;
          next(null);
        }
      });
    },
    function(next) {
      ssh = client.config.azure.ssh;
      if(!ssh) {
        next(null);
        return;
      }

      cert.getAzureCert(ssh.pem,function(err, info) {
        if(err) {
          next(err);
        } else {
          vmOptions.sshCertInfo = info;
          next(null);
        }
      });
    },
    function(next) {
      // add the ssh certificate to the service
      addCertificate(client, options.name, vmOptions.sshCertInfo.cert, ssh.pemPassword, function(err) {
        next(err);
      });
    },
    function(next) {
      // create the VM and wait for response
      createVM(client, options, vmOptions, next);
    },
    function(next) {
      // now get the actual server info
      getServer(client, options.name, next);
    }],
    function (err, result) {
      if(err) {
        console.dir(err);
        callback(err);
      } else {
        callback(null, result);
      }
    }
  );
};

var createVM = function(client, options, vmOptions, callback) {
  // check OS type of image to determine if we are creating a linux or windows VM
  switch(vmOptions.image.OS.toLowerCase()) {
    case 'linux':
      createLinuxVM(client, options, vmOptions, callback);
      break;
    case 'windows':
      createWindowsVM(client, options, vmOptions, callback);
      break;
    default:
      callback(errs.create({message: 'Unknown Image OS: ' + vmOptions.image.OS}));
      break;
  }
};

var createLinuxVM = function(client, options, vmOptions, callback) {

  var path = client.subscriptionId + '/services/hostedservices/' + options.name + '/deployments';

  // set up deployment config templates params
  var mediaLink = client.config.azure.storageAccount + options.name + '.vhd'; //TODO: need to clean this up
  var label = new Buffer(options.name).toString('base64');

  var configParams = {
    NAME: options.name,
    LABEL_BASE64: label,
    USERNAME: client.config.azure.username,
    PASSWORD: client.config.azure.password,
    SSH_CERTIFICATE_FINGERPRINT: vmOptions.sshCertInfo.fingerprint,
    PORT: client.config.azure.ssh.port || '22',
    LOCAL_PORT: client.config.azure.ssh.localPort || '22',
    ROLESIZE: options.flavor,
    OS_SOURCE_IMAGE_NAME: vmOptions.image.Name,
    OS_IMAGE_MEDIALINK: mediaLink
  };

  makeTemplateRequest(client, path, 'linuxDeployment.xml', configParams, callback);
};

var createWindowsVM = function(client, options, vmOptions, callback) {
  var path = client.subscriptionId + '/services/hostedservices/' + options.name + '/deployments';

  // set up deployment config templates params
  var mediaLink = client.config.azure.storageAccount + options.name + '.vhd'; //TODO: need to clean this up
  var label = new Buffer(options.name).toString('base64');

  var configParams = {
    NAME: options.name,
    COMPUTER_NAME: client.config.azure.computerName || options.name.slice(0, 15),
    LABEL_BASE64: label,
    PASSWORD: client.config.azure.password,
    ROLESIZE: options.flavor,
    OS_SOURCE_IMAGE_NAME: vmOptions.image.Name,
    OS_IMAGE_MEDIALINK: mediaLink
  };

  makeTemplateRequest(client, path, 'windowsDeployment.xml', configParams, callback);

};


var validateCreateOptions = function(options, config, callback) {

  if (typeof options === 'function') {
    options  = {};
  }
  options = options || {}; // no args

  // check required options values
  ['flavor', 'image', 'name'].forEach(function (member) {
    if (!options[member]) {
      errs.handle(
        errs.create({ message: 'options.' + member + ' is a required argument.' }),
        callback
      );
    }
  });

  ['username', 'password', 'location','storageAccount'].forEach(function (member) {
    if (!config.azure[member]) {
      errs.handle(
        errs.create({ message: 'config.azure.' + member + ' is a required azure config parameter.' }),
        callback
      );
    }
  });



  callback(null);
};


/**
 * getServer
 */
var getServer = exports.getServer = function(client, serverName, callback) {
  getServersFromService(client,serverName, function(err, servers) {
    if(err) {
      callback(err);
    } else {
      callback(err, servers[0] ? servers[0] : null);
    }
  });
};

var getServers = exports.getServers = function(client, callback) {

  // async execute the following tasks one by one and bail if there is an error
  async.waterfall([
    function(next) {
      // get the list of Hosted Services
      getHostedServices(client, next);
    },
    function(hostedServices, next){
      // get the list of Servers from the Hosted Services
      getServersFromServices(client, hostedServices, next);
    }],
    function (err, servers) {
      callback(err, servers);
    }
  );
};

var makeTemplateRequest = function(client, path, templateName, params, callback) {
  var headers = {},
    body;

  // async execute the following tasks one by one and bail if there is an error
  async.waterfall([
    function(next) {
      templates.load(templateName, next);
    },
    function(template, next){
      // compile template with params
      body = _.template(template, params);
      console.log(body);
      headers['content-length'] = body.length;
      headers['content-type'] = 'application/xml';
      headers['accept'] = 'application/xml';
      client.request({
        method: 'POST',
        path: path,
        body:body,
        headers: headers
      }, next, function (body, res) {
        pollRequestStatus(client, res.headers['x-ms-request-id'], MINIMUM_POLL_INTERVAL, next);
      });
    }],
    function (err, result) {
      callback(err);
    }
  );
};

var createHostedService = exports.createHostedService = function(client, serviceName, callback) {

  var path = client.subscriptionId + '/services/hostedservices';
  var params = {
    NAME: serviceName,
    LABEL_BASE64: new Buffer(serviceName).toString('base64'),
    LOCATION: client.config.azure.location
  };

  makeTemplateRequest(client, path, 'createHostedService.xml', params, callback);
};

/**
 * rebootServer
 * uses Restart Role
 * POST https://management.core.windows.net/<subscription-id>/services/hostedservices/<service-name>/deployments/<deployment-name>/roleinstances/<role-name>/operations
 * A successful operation returns status code 201 (Created). Need to poll for success?
 */
var rebootServer = exports.rebootServer = function(client, serviceName, callback) {
  var path = client.subscriptionId + '/services/hostedservices/' +
    serviceName + '/deployments/' +
    serviceName + '/roleInstances/' +
    serviceName + '/Operations';

  makeTemplateRequest(client, path, 'restartRole.xml', {}, callback);
};


/**
 * stopServer
 * uses Shutdown Role
 * POST https://management.core.windows.net/<subscription-id>/services/hostedservices/<service-name>/deployments/<deployment-name>/roleinstances/<role-name>/operations
 * A successful operation returns status code 201 (Created). Need to poll for success?
 */
var stopServer = exports.stopServer = function(client, serviceName, callback) {
  var path = client.subscriptionId + '/services/hostedservices/' +
    serviceName + '/deployments/' +
    serviceName + '/roleInstances/' +
    serviceName + '/Operations';

  makeTemplateRequest(client, path, 'shutdownRole.xml', {}, callback);
};


var addCertificate = function(client, serviceName, cert, password, callback) {

  var path = client.subscriptionId + '/services/hostedservices/' +
    serviceName + '/certificates';

  var params = {
    CERT_BASE64: new Buffer(cert).toString('base64'),
    PASSWORD: password
  };

  makeTemplateRequest(client, path, 'addCertificate.xml', params, callback);
};

var deleteHostedService = exports.deleteHostedService = function(client, serviceName, callback) {

  // DELETE https://management.core.windows.net/<subscription-id>/services/hostedservices/<service-name>
  var path = client.subscriptionId + '/services/hostedservices/' + serviceName;

  client.request({
    method: 'DELETE',
    path: path
  }, callback, function (body, res) {
    pollRequestStatus(client, res.headers['x-ms-request-id'], MINIMUM_POLL_INTERVAL, callback);
  });
};

var getHostedServices = exports.getHostedServices = function(client, callback) {

  var path = client.subscriptionId + '/services/hostedservices',
    services = [];

  client.get(path, callback, function(body, res) {
    if(body.HostedService) {
      // need to check if azure returned an array or single object
      if(_.isArray(body.HostedService)) {
        body.HostedService.forEach(function(service) {
          services.push(service);
        })
      } else {
        services.push(body.HostedService);
      }
    }
    callback(null, services);
  });
};



/**
 * destroyServer
 * uses Delete Deployment
 * DELETE https://management.core.windows.net/<subscription-id>/services/hostedservices/<service-name>/deployments/<deployment-name>
 *   Because Delete Deployment is an asynchronous operation, it always returns status code 202 (Accept).
 *   To determine the status code for the operation once it is complete, call Get Operation Status.
 * Because Delete Deployment is an asynchronous operation, it always returns status code 202 (Accept).
 */

var destroyServer = exports.destroyServer = function(client, serverName, callback) {

  var server = null;

  // async execute the following tasks one by one and bail if there is an error
  async.waterfall([
    function(next) {
      // get the list of Hosted Services
      getServer(client, serverName, next);
    },
    function(result, next) {
      server = result;
      // get the list of Hosted Services
      stopServer(client, serverName, next);
    },
    function(next){
      deleteServer(client, serverName, next);
    },
    function(next){
      deleteOSDisk(client, server, next);
    },
    function(next){
      deleteOSBlob(client, server, next);
    },
    function(next) {
      deleteHostedService(client, serverName, next);
    }],
    function (err, result) {
      callback(err, true);
    }
  );
};

var deleteServer = function(client, serverName, callback) {
  var path = client.subscriptionId + '/services/hostedservices/' + serverName;
  path +=  '/deployments/' + serverName;

  client.request({
    method: 'DELETE',
    path: path
  }, callback, function (body, res) {
    pollRequestStatus(client, res.headers['x-ms-request-id'], MINIMUM_POLL_INTERVAL, callback);
  });
};

var getOSImage = exports.getOSImage = function(client, imageName, callback) {
  var path = '/' + client.subscriptionId + '/services/images/' + imageName;

  var onError = function(err) {
    if(err.failCode === 'Item not found') {
      callback(null, null);

    } else {
      callback(err);
    }
  };

  client.get(path, onError, function(body, res) {
    callback(null, body);
  });

};


var deleteOSDisk = function(client, server, callback) {
  var diskName = null,
    path;

  if(server && server.RoleList && server.RoleList.Role) {
    if(server.RoleList.Role.OSVirtualHardDisk) {
      diskName = server.RoleList.Role.OSVirtualHardDisk.DiskName;
    }
  }

  if(diskName === null) {
    callback(null);
    return;
  }

  // https://management.core.windows.net/<subscription-id>/services/disks/<disk-name>
  path = client.subscriptionId + '/services/disks/' + diskName;

  client.request({
    method: 'DELETE',
    path: path
  }, callback, function (body, res) {
    pollRequestStatus(client, res.headers['x-ms-request-id'], MINIMUM_POLL_INTERVAL, callback);
  });
};

var deleteOSBlob = function(client, server, callback) {
  var blob = null;

  if(server && server.RoleList && server.RoleList.Role) {
    if(server.RoleList.Role.OSVirtualHardDisk) {
      blob = server.RoleList.Role.OSVirtualHardDisk.MediaLink;
    }
  }

  if(blob === null) {
    callback(null);
    return;
  }

  getStorageInfoFromUri(blob, function(err, info) {
    if(err) {
      callback(err);
    } else {
      var storage = pkgcloud.storage.createClient(client.config);
      storage.removeFile(info.container, info.file, function(err, result) {
        callback(err);
      });
    }
  });
};

/**
 * getServersFromServices
 * Retrieves all servers (VMs) from the list of services
 * @param client
 * @param services
 * @param callback
 */
var getServersFromServices = function(client, services, callback) {

  var task = function(service, next) {
    getServersFromService(client, service.ServiceName, function(err, servers) {
      next(err, servers);
    });
  };

  // Check each service for deployed VMs.
  async.concat(services, task, function(err, servers) {
    callback(err, servers);
  });
};

/**
 * getServersFromServices
 * Retrieves all servers (VMs) from a Hosted Service
 * @param client
 * @param serviceName
 * @param callback
 */
var getServersFromService = function(client, serviceName, callback) {
  var servers = [];
  getHostedServiceProperties(client, serviceName,function(err, result) {
    if(err) {
      callback(err);
    } else {
      if(result && result.Deployments && result.Deployments.Deployment) {
        if(isVM(result.Deployments.Deployment)) {
          servers.push(result.Deployments.Deployment);
        }
      }
      callback(null, servers);
    }
  });
};

var isVM = function(deployment) {
  if(deployment.RoleList && deployment.RoleList.Role) {
    if(deployment.RoleList.Role.RoleType === 'PersistentVMRole') {
      return true;
    }
  }
  return false;
};

/*
 Get Hosted Service Properties
 GET https://management.core.windows.net/<subscription-id>/services/hostedservices/<service-name>?embed-detail=true
 A successful operation returns status code 200 (OK).
 */
var getHostedServiceProperties = function(client, serviceName, callback) {

  var path = client.subscriptionId + '/services/hostedservices/' + serviceName + '?embed-detail=true';

  var onError = function(err) {
    if(err.failCode === 'Item not found') {
      callback(null, null);

    } else {
      callback(err);
    }
  };

  client.get(path, onError, function(body, res) {
    callback(null, body);
  });
};

/**
 * uses Get Operation Status
 * GET https://management.core.windows.net/<subscription-id>/operations/<request-id>
 * A successful operation returns status code 200 (OK).
 */

var pollRequestStatus = function(client, requestId, interval, callback) {

  var checkStatus = function() {
    var path = client.subscriptionId + '/operations/' + requestId;
    client.get(path, callback, function(body, res) {
      switch(body.Status) {
        case 'InProgress':
          setTimeout(checkStatus, interval);
          break;

        case 'Failed':
          callback(res.body.Error);
          break;

        case 'Succeeded':
          callback(null);
          break;
      }
    });
  };

  checkStatus();
};

var getStorageInfoFromUri = exports.getStorageInfoFromUri = function (uri, callback) {
  var u, tokens, path,
    info = {};

  u = URL.parse(uri);
  if(!u.host || !u.path) {
    callback(errs.create({message: 'invalid Azure container or blob uri'}));
    return;
  }

  tokens = u.host.split('.');
  info.storage = tokens[0];

  path = u.path;
  // if necessary, remove leading '/' from path
  if(path.charAt(0) === '/') {
    path = path.substr(1);
  }
  tokens = path.split('/');
  info.container = tokens.shift();
  info.file = tokens.join('/');

  callback(null, info);
};
