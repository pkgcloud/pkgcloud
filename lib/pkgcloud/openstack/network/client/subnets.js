/*
 * networks.js: Instance methods for working with networks
 * for Openstack networking
 *
  * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var async = require('async'),
    request = require('request'),
    pkgcloud = require('../../../../pkgcloud'),
    urlJoin = require('url-join'),
    _ = require('underscore');

/**
 * client.getSubnets
 *
 * @description get the list of networks for an account
 *
 * @param {object|Function}   options
 * @param {Number}            [options.limit]   the number of records to return
 * @param {String}            [options.marker]  Marker value. Operation returns object names that are greater than this value.
 * @param {String}            [options.end_marker]  Operation returns object names that are less than this value.
 * @param {Function}          callback
 */
exports.getSubnets  = function (options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var getSubnetOpts = {
    path: '/v2.0/subnets',
   };

  this._request(getSubnetOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    else if (!body ||!body.subnets || !(body.subnets instanceof Array)) {
      return new Error('Malformed API Response');
    }

    return callback(null, body.subnets.map(function (subnet) {
      return new self.models.Subnet(self, subnet);
    }));
  });
};

/**
 * client.getSubnet
 *
 * @description get the details for a specific network
 *
 * @param {String|object}     subnet     the subnet or subnetId
 * @param callback
 */
exports.getSubnet = function (subnet, callback) {
  var subnetId = subnet instanceof this.models.Subnet ? subnet.id : subnet,
    self = this;
  self.emit('log::trace', 'Getting details for subnet', subnetId);
  this._request({
    path: urlJoin('/v2.0/subnets', subnetId),
    method: 'GET'
  }, function (err, body, res) {
    if (err) {
      return callback(err);
    }

    if (!body || !body.subnet) {
      return new Error('Malformed API Response');
    }

    callback(null, new self.models.Subnet(self, body.subnet));
  });
};

/**
 * client.createSubnet
 *
 * @description create a new subnet
 *
 * @param {object}    options
 * @param {String}    options.name      the name of the new subnet
 * @param callback
 */
exports.createSubnet = function (options, callback) {
  var subnet = typeof options === 'object' ? options : { 'name' : options},
      self = this;

  var createSubnetOpts = {
    method: 'POST',
    path: '/v2.0/subnets',
    body: { 'subnet' : subnet}
  };

  self.emit('log::trace', 'Creating subnet', subnet);
  this._request(createSubnetOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(null, new self.models.Subnet(self, body.subnet));
  });
};

/**
 * client.updateSubnet
 *
 * @description update an existing subnet
 *
 * @param {object}    options
 * @param callback
 */
exports.updateSubnet = function (subnet, callback) {
  var self = this, subnetToUpdate = subnet instanceof this.models.Subnet ? subnet.toJSON() : subnet;
  var updateSubnetOpts = {
    method: 'PUT',
    path: urlJoin('/v2.0/subnets', subnetToUpdate.id),
    contentType: 'application/json',
    body: { 'subnet' : subnetToUpdate}
  };

  self.emit('log::trace', 'Updating subnet', subnet);
  this._request(updateSubnetOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(null, new self.models.Subnet(self, body.subnet));
  });
};

/**
 * client.destroySubnet
 *
 * @description Delete a specific network
 *
 * @param {String|object}     subnet     the subnet or subnet ID
 * @param callback
 */
exports.destroySubnet = function (subnet, callback) {
  var subnetId = subnet instanceof this.models.Subnet ? subnet.id : subnet,
    self = this;
  self.emit('log::trace', 'Deleting subnet', subnetId);
  this._request({
    path: urlJoin('/v2.0/subnets',subnetId),
    method: 'DELETE'
  }, function (err, body, res) {
    if (err) {
      return callback(err);
    }
    callback(null, subnetId);
  });
};
