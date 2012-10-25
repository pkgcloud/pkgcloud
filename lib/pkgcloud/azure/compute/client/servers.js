/*
 * servers.js: Instance methods for working with servers from Azure Cloud
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */
var async = require('async'),
  request  = require('request'),
  Buffer = require('buffer').Buffer,
  base     = require('../../../core/compute'),
  pkgcloud = require('../../../../../lib/pkgcloud'),
  errs     = require('errs'),
  azure     = require('azure'),
  async     = require('async'),
  compute  = pkgcloud.providers.azure.compute;

//
// ### function getVersion (callback)
// #### @callback {function} f(err, version).
//
// Gets the current API version
//
exports.getVersion = function getVersion(callback) {
  callback(null, this.version);
};

//
// ### function getLimits (callback)
// #### @callback {function} f(err, version).
//
// Gets the current API limits
//
exports.getLimits = function getLimits(callback) {
  return errs.handle(
    //TODO: is this correct?
    errs.create({ message: "Azure's API is not rate limited" }),
    callback
  );
};

//
// ### function _getDetails (details, callback)
// #### @details {Object} Short details of server
// #### @callback {function} f(err, details) Amended short details.
//
// Loads IP and name of server.
//
exports._getDetails = function getDetails(details, callback) {
  var self = this;

  async.parallel([
    function getName(callback) {
      self.query(
        'DescribeInstanceAttribute',
        { InstanceId: details.instanceId, Attribute: 'userData' },
        callback,
        function (body, res) {
          var meta = new Buffer(
            body.userData.value || '',
            'base64'
          ).toString();

          try {
            meta = JSON.parse(meta);
          } catch (e) {
            meta = {};
          }

          details.name = meta.name;
          callback(null);
        }
      );
    }
  ], function () {
    callback(null, details);
  });
};

//
// ### function getServers (callback)
// #### @callback {function} f(err, servers). `servers` is an array that
// represents the servers that are available to your account
//
// Lists all servers available to your account.
//
exports.getServers = function getServers(callback) {
  var self = this,
    services = [],
    servers = [],
  sm = this._getManagementService();

  var getDeployments = function(service, next) {
    var ms = self._getManagementService();
    //TODO: for now repeat service name for deployment name.
    // need to figure out how to get
    ms.getDeploymentBySlot(service, 'Production',function(err, res) {
      if(err) {
        if(res && res.body && res.body.Code === 'ResourceNotFound') {
          next(null);
        } else {
          next(err);
        }
      } else {
        servers.push(new compute.Server(self, res.body));
        next(null);
      }
    });
  };

  sm.listHostedServices(function(err, res) {
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

      // Gets deployment properties for service
      async.forEach(services,getDeployments, function(err) {
        callback(err, servers);
      });
    }
  });
};

//
// ### function createServer (options, callback)
// #### @opts {Object} **Optional** options
// ####    @name     {String} **Optional** the name of server
// ####    @image    {String|Image} the image (AMI) to use
// ####    @flavor   {String|Flavor} **Optional** flavor to use for this image
// #### @callback {Function} f(err, server).
//
// Creates a server with the specified options. The flavor
// properties of the options can be instances of Flavor
// OR ids to those entities in AWS.
//
exports.createServer = function createServer(options, callback) {

  var sm = this._getManagementService(),
    self = this,
    vmRole = {
      RoleType: 'PersistentVMRole'

    },
    deploymentOptions = {};


  if (typeof options === 'function') {
    callback = options;
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


  /**
   *
  * @param {string} serviceName           The name of the hosted service. Required.
  * @param {string} deploymentName        The name of the deployment. Required.
  * @param {object} VmRole                The PersistentVMRole object
  * @param {object} deploymentOptions     Options for deployment creation
  *                                       {
  *                                         DeploymentSlot: optional. Defaults to 'Staging'
  *                                         Label: optional. Defaults to deploymentName
  *                                       }
  * @param {function} callback            The callback function called on completion. Required.
  */
  sm.createDeployment = function(serviceName, deploymentName, vmRole,
                                                    deploymentOptions, callback) {



  }



  createOptions.ImageId = options.image instanceof base.Image
    ? options.image.id
    : options.image;

  if (options.flavor) {
    createOptions.InstanceType = options.flavor instanceof base.Flavor
      ? options.flavor.id
      : options.flavor;
  }

  if (options.keyname || options.KeyName) {
    createOptions.KeyName = options.keyname || options.KeyName;
  }

  if (options.zone || options['Placement.AvailabilityZone']) {
    createOptions['Placement.AvailabilityZone'] = options.zone
      || options['Placement.AvailabilityZone'];
  }

  return this.query(
    'RunInstances',
    createOptions,
    callback,
    function (body, res) {
      var server = undefined;

      self._toArray(body.instancesSet.item).forEach(function (instance) {
        instance.meta = meta;
        server = new compute.Server(self, instance);
      })

      callback(null, server, res);
    }
  );
};

//
// ### function destroyServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Destroy a server in AWS.
//
exports.destroyServer = function destroyServer(server, callback) {
  var serverId = server instanceof base.Server ? server.id : server;

  return this.query(
    'TerminateInstances',
    { InstanceId: serverId },
    callback,
    function (body, res) {
      callback(null, { ok: serverId }, res);
    }
  );
};

//
// ### function getServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Gets a server in AWS.
//
exports.getServer = function getServer(server, callback) {
  var self     = this,
    serverId = server instanceof base.Server ? server.id : server;

  return this.query(
    'DescribeInstances',
    {
      'InstanceId.1' : serverId,
      'Filter.1.Name': 'instance-state-code',
      'Filter.1.Value.1': 0, // pending
      'Filter.1.Value.2': 16, // running
      'Filter.1.Value.3': 32, // shutting down
      'Filter.1.Value.4': 64, // stopping
      'Filter.1.Value.5': 80 // stopped
    },
    callback,
    function (body, res) {
      var server;

      self._toArray(body.reservationSet.item).forEach(function (reservation) {
        self._toArray(reservation.instancesSet.item).forEach(function (instance) {
          server = instance;
        })
      })

      if (server === undefined) {
        callback(new Error('Server not found'));
      } else {
        self._getDetails(server, function (err, server) {
          if (err) return callback(err);
          callback(null, new compute.Server(self, server));
        });
      }
    }
  );
};


//
// ### function rebootServer (server, options, callback)
// #### @server   {Server|String} The server to reboot
// #### @callback {Function} f(err, server).
//
// Reboots a server
//
exports.rebootServer = function rebootServer(server, callback) {
  var serverId = server instanceof base.Server ? server.id : server;

  return this.query(
    'RebootInstances',
    { InstanceId: serverId },
    callback,
    function (body, res) {
      callback(null, { ok: serverId }, res);
    }
  );
};

//
// ### function renameServer(server, name, callback)
// #### @server {Server|String} Server id or a server
// #### @name   {String} New name to apply to the server
// #### @callback {Function} f(err, server).
//
// Renames a server
//
exports.renameServer = function renameServer(server, name, callback) {
  return errs.handle(
    errs.create({ message: 'Not supported by AWS.' }),
    callback
  );
};
