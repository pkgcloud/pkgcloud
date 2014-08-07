/*
 * virtual-interfacesv2.js Implementation of Rackspace os-virtual-interfacesv2 extension
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 *
 */
var Server = require('../../server').Server,
    urlJoin = require('url-join'),
    _ = require('underscore');

var _servers = 'servers',
    _extension = 'os-virtual-interfacesv2';

/**
 * client.getVirtualInterfaces
 *
 * @description Get the Virtual Interfaces for a specific instance
 * @memberof rackspace/compute
 *
 * @param {String|object}   server    The ID or instance of the Server to get instances for
 * @param {Function}        callback ( error, interfaces )
 */
exports.getVirtualInterfaces = function (server, callback) {
  var serverId = server instanceof Server ? server.id : server;

  return this._request({
    path: urlJoin(_servers, serverId, _extension)
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body.virtual_interfaces);
  });
};

/**
 * client.createVirtualInterface
 *
 * @description Create a new Virtual Interface for a provided Server and Network
 * @memberof rackspace/compute
 *
 * @param {String|object}   server    The ID or instance of the Server
 * @param {String|object}   network   The ID or instance of the Network
 * @param {Function}        callback ( error, virtual_interfaces )
 */
exports.createVirtualInterface = function (server, network, callback) {
  var serverId = server instanceof Server ? server.id : server,
      networkId = (typeof network === 'object') ? network.id : network;

  return this._request({
    method: 'POST',
    path: urlJoin(_servers, serverId, _extension),
    body: {
      virtual_interface: {
        network_id: networkId
      }
    }
  }, function (err, body) {
    return err
      ? callback(err)
      : callback(null, body.virtual_interfaces);
  });
};

/**
 * client.deleteVirtualInterface
 *
 * @description Delete a Virtual Interface from a Server
 * @memberof rackspace/compute
 *
 * @param {String|object}   server    The ID or instance of the Server
 * @param {String|object}   network   The ID or instance of the Network
 * @param {Function}        callback ( error )
 */
exports.deleteVirtualInterface = function deleteNetwork(server, network, callback) {
  var serverId = server instanceof Server ? server.id : server,
      networkId = (typeof network === 'object') ? network.id : network;

  return this._request({
    path: urlJoin(_servers, serverId, _extension, networkId),
    method: 'DELETE'
  }, function (err) {
    return callback(err);
  });
};




