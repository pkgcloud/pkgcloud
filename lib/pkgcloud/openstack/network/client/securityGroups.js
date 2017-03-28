/*
 * securityGroups.js: Instance methods for working with security groups
 * for Openstack Networking
 *
 * (C) 2015 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

var urlJoin = require('url-join');

var securityGroupsResourcePath = '/security-groups';

// Declaring variables for helper functions defined later
var _convertSecurityGroupToWireFormat;

/**
 * client.getSecurityGroups
 *
 * @description get the list of security groups for an account
 *
 * @param {object|Function}   options
 * @param {Function}          callback
 */
exports.getSecurityGroups = function (options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var getSecurityGroupOpts = {
    path: securityGroupsResourcePath
  };

  this._request(getSecurityGroupOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    else if (!body || !body.security_groups || !(body.security_groups instanceof Array)) {
      return new Error('Malformed API Response');
    }

    return callback(err, body.security_groups.map(function (securityGroup) {
      return new self.models.SecurityGroup(self, securityGroup);
    }));
  });
};

/**
 * client.getSecurityGroup
 *
 * @description get the details for a specific securityGroup
 *
 * @param {String|object}     securityGroup     the securityGroup or securityGroupId
 * @param callback
 */
exports.getSecurityGroup = function (securityGroup, callback) {
  var self = this,
    securityGroupId = securityGroup instanceof this.models.SecurityGroup ? securityGroup.id : securityGroup;
  self.emit('log::trace', 'Getting details for security group', securityGroupId);
  this._request({
    path: urlJoin(securityGroupsResourcePath, securityGroupId),
    method: 'GET'
  }, function (err, body) {
    if (err) {
      return callback(err);
    }

    if (!body ||!body.security_group) {
      return new Error('Malformed API Response');
    }

    callback(err, new self.models.SecurityGroup(self, body.security_group));
  });
};

/**
 * client.createSecurityGroup
 *
 * @description create a new security group
 *
 * @param object      securityGroup
 * @param string      securityGroup.name        Name of security group.
 * @param {string}    securityGroup.description Description of security group.
 * @param {string}    securityGroup.tenantId    The ID of the tenant who owns the security group. Only administrative users can specify a tenant ID other than their own.
 * @param callback
 */
exports.createSecurityGroup = function (securityGroup, callback) {
  var self = this;

  securityGroup = _convertSecurityGroupToWireFormat(securityGroup);

  var createSecurityGroupOpts = {
    method: 'POST',
    path: securityGroupsResourcePath,
    body: { 'security_group': securityGroup }
  };

  self.emit('log::trace', 'Creating security group', securityGroup);
  this._request(createSecurityGroupOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.SecurityGroup(self, body.security_group));
  });
};

/**
 * client.destroySecurityGroup
 *
 * @description Delete a specific securityGroup
 *
 * @param {String|object}     securityGroup     the securityGroup or securityGroup ID
 * @param callback
 */
exports.destroySecurityGroup = function (securityGroup, callback) {
  var self = this,
    securityGroupId = securityGroup instanceof this.models.SecurityGroup ? securityGroup.id : securityGroup;
  self.emit('log::trace', 'Deleting security group', securityGroupId);
  this._request({
    path: urlJoin(securityGroupsResourcePath,securityGroupId),
    method: 'DELETE'
  }, function (err) {
    if (err) {
      return callback(err);
    }
    callback(err, securityGroupId);
  });
};

/**
 * _convertSecurityGroupToWireFormat
 *
 * @description convert SecurityGroup instance into its wire representation.
 *
 * @param {object}     details    the SecurityGroup instance.
 */
_convertSecurityGroupToWireFormat = function (details){
    var wireFormat = {};
    wireFormat.name = details.name;
    wireFormat.description = details.description;
    wireFormat.tenant_id = details.tenant_id || details.tenantId;
    return wireFormat;
};
