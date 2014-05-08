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
    urlJoin = require('url-join');
    _ = require('underscore');

/**
 * client.getNetworks
 *
 * @description get the list of networks for an account
 *
 * @param {object|Function}   options
 * @param {Number}            [options.limit]   the number of records to return
 * @param {String}            [options.marker]  Marker value. Operation returns object names that are greater than this value.
 * @param {String}            [options.end_marker]  Operation returns object names that are less than this value.
 * @param {Function}          callback
 */
exports.getNetworks  = function (options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var getNetworkOpts = {
    path: '/v2.0/networks',
    qs: _.extend({
      format: 'json'
    }, _.pick(options, ['limit', 'marker', 'end_marker']))
  };

  this._request(getNetworkOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    else if (!body ||!body.networks || !(body.networks instanceof Array)) {
      return new Error('Malformed API Response');
    }

    return callback(null, body.networks.map(function (network) {
      return new self.models.Network(self, network);
    }));
  });
};

/**
 * client.getNetwork
 *
 * @description get the details for a specific network
 *
 * @param {String|object}     network     the network or networkName
 * @param callback
 */
exports.getNetwork = function (network, callback) {
  var networkName = network instanceof this.models.Network ? network.id : network,
    self = this;
  self.emit('log::trace', 'Getting details for network', networkName);
  this._request({
    path: urlJoin('/v2.0/networks',networkName),
    method: 'GET'
  }, function (err, body, res) {
    if (err) {
      return callback(err);
    }

    if (!body ||!body.network) {
      return new Error('Malformed API Response');
    }
    
    callback(null, new self.models.Network(self, body.network));
  });
};

/**
 * client.createNetwork
 *
 * @description create a new network
 *
 * @param {object}    options
 * @param {String}    options.name      the name of the new network
 * @param {object}    [options.metadata]  optional metadata about the network
 * @param callback
 */
exports.createNetwork = function (options, callback) {
  var networkName = typeof options === 'object' ? options.name : options,
      self = this;

  var createNetworkOpts = {
    method: 'PUT',
    network: networkName
  };

  if (options.metadata) {
    createNetworkOpts.headers = self.serializeMetadata(self.CONTAINER_META_PREFIX, options.metadata);
  }

  this._request(createNetworkOpts, function (err) {
    return err
      ? callback(err)
      : callback(null, new self.models.Network(self, { name: networkName, metadata: options.metadata }));
  });
};
