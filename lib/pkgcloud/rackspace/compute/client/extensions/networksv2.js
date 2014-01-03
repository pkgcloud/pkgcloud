/*
 * networksv2.js Implementation of Rackspace os-networksv2 extension
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 *
 */

var urlJoin = require('url-join'),
    _       = require('underscore');

var _extension = 'os-networksv2';

/**
 * client.getNetworks
 *
 * @description Display the currently available networks
 *
 * @param {Function}    callback    f(err, networks) where networks is an array of networks
 * @returns {*}
 */
exports.getNetworks = function (callback) {
  return this.request({
    path: _extension
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body.networks);
  });
};

/**
 * client.getNetwork
 *
 * @description Get the details for a specific network
 *
 * @param {String|object}   network   The network or networkId to get
 * @param {Function}        callback
 * @returns {*}
 */
exports.getNetwork = function (network, callback) {
  var networkId = (typeof network === 'object') ? network.id : network;

  return this.request({
    path: urlJoin(_extension, networkId)
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body.network);
  });
};

/**
 * client.createNetwork
 *
 * @description Create a new user defined network.
 *
 * @param {object}      options
 * @param {String}      options.label     The name of the new network
 * @param {String}      options.cidr      The IP block to allocate for the network
 * @param callback
 */
exports.createNetwork = function(options, callback) {
  return this.request({
    method: 'POST',
    path: _extension,
    body: {
      network: _.pick(options, ['label', 'cidr'])
    }
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body.network);
  });
};

/**
 * client.deleteNetwork
 *
 * @description Delete a network from the current account
 *
 * @param {String|object}   network   The network or networkId to get
 * @param {Function}        callback
 * @returns {*}
 */
exports.deleteNetwork = function deleteNetwork(network, callback) {
  var networkId = (typeof network === 'object') ? network.id : network;

  return this.request({
    path: urlJoin(_extension, networkId),
    method: 'DELETE'
  }, function (err) {
    return callback(err);
  });
};




