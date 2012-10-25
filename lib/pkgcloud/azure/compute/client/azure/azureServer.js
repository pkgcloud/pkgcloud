var azure = require('azure');
var async = require('async');
var URL = require('url');
var fs = require('fs');


var subscriptionId = '409efed7-eabe-45ea-adec-a92dfc9cddfc';
var username = "Nodejitsu";

var auth = {
  keyfile: '/Users/stammen/.azure/managementCertificate.pem',
  certfile: '/Users/stammen/.azure/managementCertificate.pem'
};

var hostOptions = {
  host: 'management.core.windows.net',
  apiversion: '2012-03-01',
  serializetype: 'XML'
};

var AzureServer = exports.AzureServer = function(config) {
  this.config = config;

  this.auth = {
    keyfile: config.auth.pemFile,
    certfile: config.auth.pemFile
  };

  this.hostedService = null;
  this.images = [];
  this.storageAccounts = [];
  this.deployments = [];
  this.options = {};
  this.requestId = null;
  this.storageKey = null; // the Azure blob storage key
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

  var self = this;

  // async execute the following tasks one by one and bail if there is an error
  async.waterfall([
    function(callback){
      // validate createServer options
      self.validateCreateOptions(options, callback);
    },
    function(callback){
      // get the HostedService we need to create a VM
      self.getHostedService(callback);
    },
    function(callback){
      // if the HostedService does not exist, create it
      if(self.hostedService === null) {
        self.createHostedService(callback);
      } else {
        // skip this step if hostedService already exists
        callback(null);
      }
    },
    function(callback){
      // get a list of the user's OSImages
      self.getOSImages(callback);
    },
    function(callback){
      // get a list of the user's Storage accounts
      self.getStorageAccounts(callback);
    },
    function(callback){
      self.createVM(callback);
    },
    function(callback){
      self.requestStatus(callback);
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

  console.dir(options);
  this.options = options;
  callback(null);
};

AzureServer.prototype.getHostedService = function(callback) {

  var sm = azure.createServiceManagementService(subscriptionId, this.auth, hostOptions),
    self = this,
    options = {};

  var serviceName = this.options.serviceName ? this.options.serviceName : this.options.name;

  sm.getHostedService(serviceName, function(err, result) {
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

AzureServer.prototype.createHostedService = function(callback) {

  var sm = azure.createServiceManagementService(subscriptionId,this.auth,hostOptions),
    self = this,
    serviceOptions = {};

  var serviceName = this.options.serviceName ? this.options.serviceName : this.options.name;
  if(this.options.AffinityGroup) {
    serviceOptions.AffinityGroup = this.options.AffinityGroup;
  }

  if(this.options.Location) {
    serviceOptions.Location = this.options.Location;
  }

  // create the hosted service
  sm.createHostedService(serviceName, serviceOptions, function(err, result) {
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
  var sm = azure.createServiceManagementService(subscriptionId,this.auth,hostOptions),
    self = this;

  sm.listHostedServices(function(err, result) {
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
  var sm = azure.createServiceManagementService(subscriptionId,this.auth,hostOptions),
    self = this;

  sm.listOSImage(function(err, result) {
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
  var sm = azure.createServiceManagementService(subscriptionId,this.auth,hostOptions),
    self = this;

  sm.listStorageAccounts(function(err, result) {
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

// find first storage account that is in the correct Azure Location or AffinityGroup
AzureServer.prototype.findStorageAccount = function(callback) {

  var self = this;
  var getStorageAccountInfo = function(account, next) {
    var sm = azure.createServiceManagementService(subscriptionId,self.auth,hostOptions);
    sm.getStorageAccountKeys(account.ServiceName, function(err, result) {
      if(err) {
        next(err);
      } else {
        console.dir(result);
        next(null);
      }
    });
  }

  async.forEach(this.storageAccounts, getStorageAccountInfo, function(err){
    // result now equals the first file in the list that exists
  });
};

// find first storage account that is in the correct Azure Location or AffinityGroup
AzureServer.prototype.getStorageAccountKeys = function(storageName, callback) {

  var sm = azure.createServiceManagementService(subscriptionId,this.auth,hostOptions),
    self = this;

  sm.getStorageAccountKeys(account.ServiceName, function(err, result) {
    if(err) {
      next(err);
    } else {
      self.storageKey = result.body.StorageServiceKeys.Primary;
      next(null);
    }
  });
}

AzureServer.prototype.createOSImageUri = function(callback) {
  var sm = azure.createServiceManagementService(subscriptionId,this.auth,hostOptions),
    self = this;

  var image = URL.parse(this.options.image);
  if(!image.protocol) {

  }
  callback(null);

};

AzureServer.prototype.requestStatus = function(callback) {

  var sm = azure.createServiceManagementService(subscriptionId, auth, hostOptions),
    self = this;

  sm.getOperationStatus(this.requestId, function(err, result) {
    if(err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
};

AzureServer.prototype.createVM = function(callback) {

  var sm = azure.createServiceManagementService(subscriptionId,this.auth,hostOptions),
    self = this;

  var deploymentOptions = {
  }

  var osDisk = {
    SourceImageName : 'OpenLogic__OpenLogic-CentOS-62-20120531-en-us-30GB.vhd',
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


  sm.createDeployment(this.options.name,
    this.options.name,
    VMRole, deploymentOptions,
    function(err, res) {
      if(err) {
        callback(err);
      } else {
        self.requestId = res.headers['x-ms-request-id'];
        callback(null);
      }
    });
};

var options = {
  name: "create-test-ids2",
  flavor: "ExtraSmall",
  image: "CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd"
};

/*
// load azure config file
var config = JSON.parse(fs.readFileSync("../../../../test/configs/azure.json",'utf8'));
console.dir(config);


var server = new AzureServer(config);
server.createServer(options, function(err, results) {

  if(err) {
    console.log(err);
  } else {
    //console.dir(server.hostedService);
    //console.dir(server.images);
    //console.dir(server.storageAccounts);
  }
});


{
    ssh:{
        publickeys:{
            publickey:{
                fingerprint:'certificate-fingerprint',
                path:'SSH-public-key-storage-location'
            }
        },
        keypairs:{
            keypair:{
                fingerprint:{
                    value:'certificate-fingerprint',
                    path:'SSH-public-key-storage-location'
                }
            }
        }
    }
}
*/


