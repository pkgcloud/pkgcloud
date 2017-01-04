/*
 * server.js: Azure Server
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var util = require('util');
var base  = require('../../core/compute/server');
var _ = require('lodash');

var Server = exports.Server = function Server(client, details) {
  base.Server.call(this, client, details);
  this.requestPending = false;
};

util.inherits(Server, base.Server);

Server.prototype._setProperties = function (details) {

  details = details || {};
  this.id = details.id || '';
  this.name = details.name || '';
  this.location = details.location;

  //console.log('Status: ' + details.Status + ' RoleInstanceList: ' + roleInstance ? roleInstance.InstanceStatus : 'UNKNOWN');

  // azure can return an inconsistent RoleInstance status (not in azure rest api docs) so we check everything.
  // an azure vm has a complicated state machine. We need to check the status of both the deployment and the role.
  // azure first starts a deployment and then starts a role. The role seems to go through STOPPEDVM, PROVISIONING and then
  // READYROLE.
  // Note: since azureAPI has to wait until azure responds to our createServer request, we most likely will miss all of the
  // deployment states unless something goes wrong
  // TODO: there doesn't seem to be an ERROR or FAIL status in pkgcloud

  var statuses = details.instanceView && details.instanceView.statuses || [];
  var provisioningStatus = _.find(statuses, status => status.code.startsWith('ProvisioningState/')) || {};
  var powerStateStatus = _.find(statuses, status => status.code.startsWith('PowerState/')) || {};

  // Azure ARM VMs are natively constructed out of a collection of roles.
  if (provisioningStatus.code == 'ProvisioningState/succeeded' && powerStateStatus.code == 'PowerState/deallocated') {
    this.status = this.STATUS.stopped;
  } else if (provisioningStatus.code == 'ProvisioningState/succeeded' && powerStateStatus.code == 'PowerState/running') {
    this.status = this.STATUS.running;
  } else {
    this.status = this.STATUS.unknown;
  }

  var addresses = { private: [], public: [] };

  // TODO: Need to clean up once I understand what is private ip?
  this.addresses = details.addresses = addresses;

  if (details.RoleList && details.RoleList.Role) {
    if (details.RoleList.Role.OSVirtualHardDisk) {
      this.imageId = details.RoleList.Role.OSVirtualHardDisk.SourceImageName;
    }
  }

  this.serviceName = details.serviceName || details.Name;

  this.original = this.azure = details;
};
