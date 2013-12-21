/*
 * networks.js Implementation of OpenStack os-networks extension
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 *
 */

var urlJoin = require('url-join');

var _extension = 'os-networks';

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
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, body.networks, res);
  });
};




