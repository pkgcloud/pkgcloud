var HeaderConstants = require('./constants').HeaderConstants;
var async = require('async');
var templates = require('../compute/templates/templates');
var _ = require('underscore');

exports.MANAGEMENT_API_VERSION = '2012-03-01';
exports.STORAGE_API_VERSION = HeaderConstants.TARGET_STORAGE_VERSION;
var MINIMUM_POLL_INTERVAL = exports.MINIMUM_POLL_INTERVAL = 2000;

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

  var self = this;

  // async execute the following tasks one by one and bail if there is an error
  async.waterfall([
    function(next) {
      // get the list of Hosted Services
      self.getHostedServices(client, next);
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

/*
 getHostedServices
 uses azure List Hosted Services
 GET https://management.core.windows.net/<subscription-id>/services/hostedservices
 A successful operation returns status code 200 (OK).
 */

var getHostedServices = exports.getHostedServices = function(client, callback) {

  var path = client.subscriptionId + '/services/hostedservices',
    self = this,
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
 * stopServer
 * uses Shutdown Role
 * POST https://management.core.windows.net/<subscription-id>/services/hostedservices/<service-name>/deployments/<deployment-name>/roleinstances/<role-name>/operations
 * A successful operation returns status code 201 (Created). Need to poll for success?
 */
var stopServer = exports.stopServer = function(client, serviceName, callback) {
  var self = this,
    headers = {};
  var path = client.subscriptionId + '/services/hostedservices/' +
    serviceName + '/deployments/' +
    serviceName + '/roleInstances/' +
    serviceName + '/Operations';

  console.log(path);

  // async execute the following tasks one by one and bail if there is an error
  async.waterfall([
    function(next) {
      // get the list of Hosted Services
      templates.load('shutdownRole.xml', next);
    },
    function(template, next){
      headers['content-length'] = template.length;
      headers['content-type'] = 'application/xml';
      headers['accept'] = 'application/xml';

      client.request({
        method: 'POST',
        path: path,
        body: template,
        headers: headers
      }, next, function (body, res) {
        self.pollRequestStatus(client, res.headers['x-ms-request-id'], MINIMUM_POLL_INTERVAL, next);
      });
    }],
    function (err, result) {
      callback(err,result);
    }
  );
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

  var self = this;

  // async execute the following tasks one by one and bail if there is an error
  async.waterfall([
    function(next) {
      // get the list of Hosted Services
      getServersFromService(client, serverName, next);
    },
    function(servers, next){
      next(null, servers);

    }],
    function (err, result) {
      callback(err, result);
    }
  );
};

/**
 * getServersFromServices
 * Retrieves all servers (VMs) from the list of services
 * @param client
 * @param services
 * @param callback
 */
var getServersFromServices = function(client, services, callback) {

  var self = this;

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

  var self = this;
  var servers = [];
  getHostedServiceProperties(client, serviceName,function(err, result) {
    if(err) {
      callback(err);
    } else {
      if(result.Deployments) {
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
}

/*
 Get Hosted Service Properties
 GET https://management.core.windows.net/<subscription-id>/services/hostedservices/<service-name>?embed-detail=true
 A successful operation returns status code 200 (OK).
 */
var getHostedServiceProperties = function(client, serviceName, callback) {

  var path = client.subscriptionId + '/services/hostedservices/' + serviceName + '?embed-detail=true',
    self = this;

  client.get(path, callback, function(body, res) {
    callback(null, body);
  });
};

/**
 * uses Get Operation Status
 * GET https://management.core.windows.net/<subscription-id>/operations/<request-id>
 * A successful operation returns status code 200 (OK).
 */

var pollRequestStatus = exports.pollRequestStatus = function(client, requestId, interval, callback) {

  var self = this;

  var checkStatus = function() {
    var path = client.subscriptionId + '/operations/' + requestId;
    client.get(path, callback, function(body, res) {
      switch(body.Status) {
        case 'InProgress':
          setTimeout(checkStatus, interval);
          break;

        case 'Failed':
          callback(result.body.Error);
          break;

        case 'Succeeded':
          callback(null, true);
          break;
      }
    });
  };

  checkStatus();
};



/*

 Get Deployment
 GET https://management.core.windows.net/<subscription-id>/services/hostedservices/<service-name>/deployments/<deployment-name>
 A successful operation returns status code 200 (OK).

 Get Operation Status
 GET https://management.core.windows.net/<subscription-id>/operations/<request-id>
 A successful operation returns status code 200 (OK).
 Response Body
 <?xml version="1.0" encoding="utf-8"?>
 <Operation xmlns="http://schemas.microsoft.com/windowsazure">
 <ID>request-id</ID>
 <Status>InProgress|Succeeded|Failed</Status>
 <!--Response includes HTTP status code only if the operation succeeded or failed -->
 <HttpStatusCode>http-status-code-for-asynchronous-operation</HttpStatusCode>
 <!--Response includes additional error information only if the operation failed -->
 <Error>
 <Code>error-code</Code>
 <Message>error-message</Message>
 </Error>
 </Operation>

 Create Deployment
 POST https://management.core.windows.net/<subscription-id>/services/hostedservices/<service-name>/deploymentslots/<deployment-slot-name>
 Headers:
 Content-Type Set this header to application/xml.
 Because Create Deployment is an asynchronous operation, it always returns status code 202

 Delete Deployment
 DELETE https://management.core.windows.net/<subscription-id>/services/hostedservices/<service-name>/deployments/<deployment-name>
 Because Delete Deployment is an asynchronous operation, it always returns status code 202 (Accept).
 To determine the status code for the operation once it is complete, call Get Operation Status.
 The status code is embedded in the response for this operation; if successful, it will be status code 200 (OK).

 Restart role
 POST https://management.core.windows.net/<subscription-id>/services/hostedservices/<service-name>/deployments/<deployment-name>/roles/<role-name>/Operations
 Request Body
 <RestartRoleOperation xmlns="http://schemas.microsoft.com/windowsazure" xmlns:i="http://www.w3.org/2001/XMLSchema-instance">
 <OperationType>RestartRoleOperation</OperationType>
 </RestartRoleOperation>
 A successful operation returns status code 201 (Created).

 Capture Role
 POST https://management.core.windows.net/<subscription-id>/services/hostedservices/<service-name>/deployments/<deployment-name>/roleinstances/<role-name>/Operations
 A successful operation returns status code 201 (Created). Need to poll for success?

 Shutdown Role
 POST https://management.core.windows.net/<subscription-id>/services/hostedservices/<service-name>/deployments/<deployment-name>/roleinstances/<role-name>/Operations
 A successful operation returns status code 201 (Created). Need to poll for success?


 */

