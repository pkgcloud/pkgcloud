var azure = require('azure');
var async = require('async');
var URL = require('url');
var fs = require('fs');
var errs = require('errs');
var serviceUtils = require('./serviceUtils');
var azureUtils = require('../../../utils/azureUtils');

// poll interval for Azure async function results
var DEFAULT_POLL_INTERVAL = 2000;

var AzureServerInfo = exports.AzureServerInfo = function(serviceName, name, details) {
  this.serviceName = serviceName;
  this.name = name;
  this.server = details;
};

var AzureServer = exports.AzureServer = function(config) {
  this.config = config;

  var auth = {
    keyfile: config.auth.pemFile,
    certfile: config.auth.pemFile
  };

  this.subscriptionId = config.auth.subscriptionId;
  this.hostedService = null;
  this.images = [];
  this.storageAccounts = [];
  this.deployments = [];
  this.options = {};
  this.storageKey = null; // the Azure blob storage key
  this.serviceManager = azure.createServiceManagementService(this.subscriptionId, auth);
  this.blobService = azure.createBlobService(this.config.auth.storageName,
    this.config.auth.storageApiKey,
    azure.ServiceClient.CLOUD_BLOB_HOST)
    .withFilter(new azure.ExponentialRetryPolicyFilter()
  );
};

/*
 In order to deploy a vm, the azure-node-sdk requires us to do the following
 before we can call the SDK's createDeployment() method.
 1. get or create a Hosted Service
 2. resolve the OSImage url to a container on the user's account
 3. create the container if it does not exist
 4. now call createDeployment().
 */

AzureServer.prototype.createServer = function(options, next) {

  var self = this,
    serverInfo = new AzureServerInfo();

  // async execute the following tasks one by one and bail if there is an error
  async.waterfall([
    function(callback) {
      // validate createServer options
      self.validateCreateOptions(options, callback);
    },
    function(callback) {
      // get the HostedService we need to create a VM
      serverInfo.serviceName = options.name;
      serverInfo.name = options.name;

      self.getHostedService(callback);
    },
    function(callback) {
      // if the HostedService does not exist, create it
      if(self.hostedService === null) {
        self.createHostedService(callback);
      } else {
        // skip this step if hostedService already exists
        callback(null);
      }
    },
    function(callback) {
      // get a list of the user's OSImages
      self.getOSImages(callback);
    },
    function(callback){
      // get a list of the user's Storage accounts
      self.getStorageAccounts(callback);
    },
    function(callback) {
      // create the VM and wait for response
      self.createVM(callback);
    },
    function(callback) {
      // now get the actual server info
      self.getServerDeployment(serverInfo,callback);
    }],
    function (err, result) {
      if(err) {
        console.dir(err);
        next(err);
      } else {
        next(null, result);
      }
    }
  );
};

AzureServer.prototype.pollRequestStatus = function(requestId, interval, callback) {

  var self = this;

  var checkStatus = function() {
    self.requestStatus(requestId, function(err, result) {
      if(err) {
        callback(err);
      } else {
        switch(result.body.Status) {
          case 'InProgress':
            setTimeout(checkStatus, interval);
            break;

          case 'Failed':
            callback(result.body.Error);
            break;

          case 'Succeeded':
            callback(null);
            break;
        }
      }
    });
  };

  checkStatus();
};

//testServer.setWait({ status: 'RUNNING' }, 5000, function () {

AzureServer.prototype.getDeployment = function (serviceName, callback) {
  var servers = [];

  this.serviceManager.getDeploymentBySlot(serviceName, 'Production', function(err, res) {
    if(err) {
      if(res && res.body && res.body.Code === 'ResourceNotFound') {
        // No deployments here. Move on to the next service.
        callback(null);
      } else {
        callback(err);
      }
    } else {
      // found a vm. Add it to our list of servers.
      servers.push(new AzureServerInfo(serviceName,res.body.Name, res.body));
      callback(null, servers);
    }
  });
}

AzureServer.prototype.getServers = function (callback) {
  var self = this,
    services = [];

  var getDeployment = function(serviceName, callback) {
    self.getDeployment(serviceName,callback);
  };

  // fetch the list of Hosted Services
  this.serviceManager.listHostedServices(function(err, res) {
    if(err) {
      callback(err)
    } else {

      var rsp = res.body;
      var rspdata;
      // depending on serialization, there may be a HostedService object or not.
      if (rsp.HostedService) {
        rspdata = rsp.HostedService;
      } else {
        // JSON data does not have name for top level object
        rspdata = rsp;
      }

      if (rspdata instanceof Array) {
        var len = rspdata.length;
        for (var i = 0; i < len; i++) {
          services.push(rspdata[i].ServiceName);
        }
      } else if (rspdata) {
        services.push(rspdata.ServiceName);
      }

      // Check each service for deployed VMs.
      async.concat(services, getDeployment, function(err, servers) {
        callback(err, servers);
      });
    }
  });
};

AzureServer.prototype.getServerDeployment = function (server, callback) {
  var self = this;

  this.serviceManager.getDeployment(server.serviceName, server.name, function(err, res) {
    if(err) {
      if(res && res.body && res.body.Code === 'ResourceNotFound') {
        callback(null,null)
      } else {
        callback(err);
      }
    } else {
      callback(null, new AzureServerInfo(server.serviceName, server.name, res.body));
    }
  });
};

AzureServer.prototype.findServer = function (server, callback) {

  if(server instanceof AzureServerInfo) {
    this.getServerDeployment(server, callback);
    return;
  }

  // search  all Hosted Services for a vm with matching name
  this.getServers(function(err,servers) {
    if(err) {
      callback(err);
    } else {
      var name = server.toLowerCase();
      for(var i = 0; i < servers.length; i++) {
        if(servers[i].name.toLowerCase() === name) {
          callback(null, servers[i]);
          return;
        }
      }
      callback(null, null);
    }
  });
};

AzureServer.prototype.deleteServer = function (server, callback) {

  var self = this;

  this.serviceManager.deleteDeployment(server.serviceName, server.name, function(err, res) {
    if(err) {
      callback(err);
    } else {
      var requestId = res.headers['x-ms-request-id'];
      serviceUtils.pollRequestStatus(requestId, DEFAULT_POLL_INTERVAL, self.serviceManager, callback);
    }
  });
};

AzureServer.prototype.deleteOSDisk = function (serverInfo, callback) {

  var server = serverInfo.server,
    disk = null,
    self = this;

  if(server && server.RoleList && server.RoleList[0]) {
    if(server.RoleList[0].OSVirtualHardDisk) {
      disk = server.RoleList[0].OSVirtualHardDisk.DiskName;
    }
  }

  console.log("deleting OS Disk:" + disk);
  this.serviceManager.deleteDisk(disk, function(err, res) {
    if(err) {
      callback(err);
    } else {
      var requestId = res.headers['x-ms-request-id'];
      serviceUtils.pollRequestStatus(requestId, DEFAULT_POLL_INTERVAL, self.serviceManager, callback);
    }
  });
};

AzureServer.prototype.deleteOSBlob = function (serverInfo, callback) {

  var server = serverInfo.server,
    blob = null,
    self = this;

  if(server && server.RoleList && server.RoleList[0]) {
    if(server.RoleList[0].OSVirtualHardDisk) {
      blob = server.RoleList[0].OSVirtualHardDisk.MediaLink;
    }
  }

  if(blob === null) {
    callback(null);
  } else {
    console.log("deleting OS storage blob:" + blob);
    azureUtils.getStorageInfoFromUri(blob,function(err, info) {
      if(err) {
        callback(err);
      } else {
        self.blobService.deleteBlob(info.container, info.file, function(err, res) {
          callback(err);
        });
      }
    });
  }
};



/*******************************
 * destroyServer()
 * 1. Check if the server exists
 * 3. Delete the server
 * 4. Delete the OSDisk
 * 5. Delete the hosted service?
 *******************************/

AzureServer.prototype.destroyServer = function(serverInfo, next) {

  var self = this;
  var server = null;

  // async execute the following tasks one by one and bail if there is an error
  async.waterfall([
    function(callback) {
      // find the server on Azure
      self.findServer(serverInfo, callback);
    },
    function(serverResult, callback) {
      if(serverResult === null) {
        callback(errs.create({ message: 'Cannot destroy Server' +  serverInfo.name + '. Server not found'}));
      } else {
        server = serverResult;
        callback(null);
      }
    },
    function(callback){
      // delete the server
      self.deleteServer(server, callback);
    },
    function(callback){
      // delete the osDisk if it is not a User disk
      self.deleteOSDisk(server, callback);
    },
    function(callback){
      // delete the osDisk storage blob
      self.deleteOSBlob(server, callback);
    },
    function(callback) {
      // TODO: delete HostedServer?
      self.deleteHostedService(server.serviceName, callback);
    }],
    function (err, result) {
      next(err, result);
    }
  );
};

AzureServer.prototype.validateCreateOptions = function(options, callback) {

  if (typeof options === 'function') {
    options  = {};
  }

  options = options || {}; // no args

  if (!options.image) {
    return errs.handle(
      errs.create({
        message: 'options.image is a required argument.'
      }),
      callback
    );
  }

  if (!options.name) {
    return errs.handle(
      errs.create({
        message: 'options.name is a required argument.'
      }),
      callback
    );
  }

  //TODO: what is the default flavor?
  options.flavor = options.flavor || 'ExtraSmall';

  //TODO: what is the default Location or AffinityGroup?
  options.Location = options.Location || this.config.azure.Location || 'West US';

  options.storageAccount = options.storageAccount || this.config.azure.StorageAccount || null;

  //console.dir(options);
  this.options = options;
  callback(null);
};

AzureServer.prototype.getHostedService = function(callback) {

  var self = this,
    serviceName = this.options.serviceName ? this.options.serviceName : this.options.name;

  this.serviceManager.getHostedService(serviceName, function(err, result) {
    if(err) {
      if(err.code === 'ResourceNotFound') {
        self.hostedService = null;
        callback(null);
      } else {
        callback(err);
      }
    } else {
      if(result.statusCode !== 200) {
        self.hostedService = null;
      } else {
        self.hostedService = result.body;
        // TODO: check for same AffinityGroup and/or Location
      }
      callback(null);
    }
  });
};

AzureServer.prototype.deleteHostedService = function(name, callback) {

  var self = this;

  this.serviceManager.deleteHostedService(name, function(err, res) {
    if(err) {
      callback(err);
    } else {
      var requestId = res.headers['x-ms-request-id'];
      serviceUtils.pollRequestStatus(requestId, DEFAULT_POLL_INTERVAL, self.serviceManager, callback);
    }
  });
};

AzureServer.prototype.createHostedService = function(callback) {

  var self = this,
    serviceOptions = {};

  var serviceName = this.options.serviceName ? this.options.serviceName : this.options.name;
  if(this.options.AffinityGroup) {
    serviceOptions.AffinityGroup = this.options.AffinityGroup;
  }

  if(this.options.Location) {
    serviceOptions.Location = this.options.Location;
  }

  // create the hosted service
  this.serviceManager.createHostedService(serviceName, serviceOptions, function(err, result) {
    if(err) {
      callback(err);
    } else {
      // get the newly created service
      self.getHostedService(function(err,result) {
        callback(err);
      });
    }
  });
};

AzureServer.prototype.getHostedServices = function(callback) {
  var self = this;

  this.serviceManager.listHostedServices(function(err, result) {
    if(err) {
      callback(err);
    } else {
      if(result.body) {
        result.body.map(function (data) {
          self.hostedServices.push(data);
        });
      }
      callback(null);
    }
  });
};

AzureServer.prototype.getOSImages = function(callback) {
  var self = this;

  this.serviceManager.listOSImage(function(err, result) {
    if(err) {
      callback(err);
    } else {
      if(result.body) {
        result.body.map(function (data) {
          self.images.push(data);
        });
      }
      callback(null);
    }
  });
};

AzureServer.prototype.getStorageAccounts = function(callback) {
  var self = this;

  this.serviceManager.listStorageAccounts(function(err, result) {
    if(err) {
      callback(err);
    } else {
      if(result.body) {
        result.body.map(function (data) {
          self.storageAccounts.push(data);
        });
      }
      callback(null);
    }
  });
};

AzureServer.prototype.getStorageAccountKeys = function(storageName, callback) {

  var self = this;

  this.serviceManager.getStorageAccountKeys(account.ServiceName, function(err, result) {
    if(err) {
      next(err);
    } else {
      self.storageKey = result.body.StorageServiceKeys.Primary;
      next(null);
    }
  });
};

AzureServer.prototype.createOSImageUri = function(callback) {
  var self = this,
    image = URL.parse(this.options.image);

  if(!image.protocol) {

  }
  callback(null);
};

AzureServer.prototype.requestStatus = function(requestId, callback) {
  this.serviceManager.getOperationStatus(requestId, function(err, result) {
    if(err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

AzureServer.prototype.createVM = function(callback) {

  var self = this;

  // azure ServiceManagement will fill this out
  var deploymentOptions = {};

  var osDisk = {
    SourceImageName : this.options.image,
    MediaLink: this.options.storageAccount + this.options.name + '.vhd'
  };

  var linuxProvisioningConfigurationSet = {
    ConfigurationSetType: 'LinuxProvisioningConfiguration',
    HostName: this.options.name,
    UserName: 'stammen',
    UserPassword: 'Abc.123!!',
    DisablePasswordAuthentication: 'false'
  };

  var VMRole = {
    RoleName: this.options.name,
    RoleSize: this.options.flavor,
    OSVirtualHardDisk: osDisk,
    ConfigurationSets: [linuxProvisioningConfigurationSet]
  };

  console.log("creating VM:" + this.options.name);

  this.serviceManager.createDeployment(this.options.name,
    this.options.name,
    VMRole, deploymentOptions,
    function(err, res) {
      if(err) {
        callback(err);
      } else {
        var requestId = res.headers['x-ms-request-id'];
        serviceUtils.pollRequestStatus(requestId, DEFAULT_POLL_INTERVAL, self.serviceManager, callback);
      }
    }
  );
};




