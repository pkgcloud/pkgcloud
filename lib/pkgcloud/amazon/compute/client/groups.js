/*
 * groups.js: Implementation of AWS SecurityGroups Client.
 *
 */

var errs  = require('errs'),
    util = require('util'),
    _     = require('underscore');

//
// ### function listGroups (options, callback)
// #### @options {Object} **Optional** Filter parameters when listing keys
// #### @callback {function} Continuation to respond to when complete.
//
// Lists all EC2 SecurityGroups matching the specified `options`.
//
exports.listGroups = function (options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  var self = this;
  options = options || {};

  var requestOpts = {};

  if (options.groupNames) {
    requestOpts.GroupNames = options.groupNames;
  }

  if (options.groupIds) {
    requestOpts.GroupIds = options.groupIds;
  }

  self.ec2.describeSecurityGroups(requestOpts, function(err, data) {
    if (err) {
      callback(err);
      return;
    }

    callback(err, data.SecurityGroups);
  });
};

//
// ### function getGroup (name, callback)
// #### @name {string} Name of the EC2 Security Group to get
// #### @callback {function} Continuation to respond to when complete.
//
// Gets the details of the EC2 SecurityGroup with the specified `name`.
//
exports.getGroup = function (name, callback) {
  this.listGroups({ groupNames: [ name ] }, function(err, groups) {
    if (err) {
      callback(err);
    } else if (groups && groups[0]) {
      callback(err, groups[0]);
    }
    else {
      callback(new Error('Group not found'));
    }
  });
};

//
// ### function addGroup (options, callback)
// #### @options {Object} Security Group details
// ####     @name {string} String name of the group
// ####     @description  {string} Description of the group
// #### @callback {function} Continuation to respond to when complete.
//
// Adds an EC2 SecurityGroup with the specified `options`.
//
exports.addGroup = function (options, callback) {
  if (!options || !options.name || !options.description) {
    return errs.handle(
      errs.create({ message: '`name` and `description` are required options.' }),
      callback
    );
  }

  var requestOpts = {
    GroupName: options.name,
    Description: options.description
  };

  this.ec2.createSecurityGroup(requestOpts, function(err, data) {
    return err
      ? callback(err)
      : callback(null, _.extend(requestOpts, { GroupId: data.GroupId }));
  });
};

//
// ### function delGroup (name, callback)
// #### @name {string} Name of the EC2 Security Group to destroy
// #### @callback {function} Continuation to respond to when complete.
//
// Destroys EC2 SecurityGroup with the specified `name`.
//
exports.destroyGroup = function (name, callback) {
  this.ec2.deleteSecurityGroup({ GroupName: name }, function(err) {
    return err
      ? callback(err)
      : callback(null, true);
  });
};

//
// ### function addRules (options, callback)
// #### @options {Object} Ingress rules Group details
// ####     @name {string} String name of the group
// ####     @rules  {object} Ingress rules to apply
// #### @callback {function} Continuation to respond to when complete.
//
// Note: rules must match the format of the AWS API
//  - http://docs.aws.amazon.com/AWSEC2/latest/APIReference/ApiReference-query-AuthorizeSecurityGroupIngress.html
//
// Add Ingress Rules to a SecurityGroup with the specified `name`.
//
exports.addRules = function (options, callback) {
  if (!options || !options.name || !options.rules) {
    return errs.handle(
      errs.create({ message: '`name` and `rules` are required options.' }),
      callback
    );
  }

  // Simply append the group name to the rules - override if existing
  this.ec2.authorizeSecurityGroupIngress({
    GroupName: options.name,
    IpPermissions: options.rules
  }, function(err) {
    return err
      ? callback(err)
      : callback(null, true);
  });
};

//
// ### function delRules (options, callback)
// #### @options {Object} Ingress rules Group details
// ####     @name {string} String name of the group
// ####     @rules  {object} Ingress rules to revoke
// #### @callback {function} Continuation to respond to when complete.
//
// Note: rules must match the format of the AWS API
//  - http://docs.aws.amazon.com/AWSEC2/latest/APIReference/ApiReference-query-AuthorizeSecurityGroupIngress.html
//
// Revoke Ingress Rules to a SecurityGroup with the specified `name`.
//
exports.delRules = function (options, callback) {
  if (!options || !options.name || !options.rules) {
    return errs.handle(
      errs.create({ message: '`name` and `rules` are required options.' }),
      callback
    );
  }

  // Simply append the group name to the rules - override if existing
  this.ec2.revokeSecurityGroupIngress({
    GroupName: options.name,
    IpPermissions: options.rules
  }, function (err) {
    return err
      ? callback(err)
      : callback(null, true);
  });
};
