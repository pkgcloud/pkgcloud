/*
 * nodes.js: Rackspace loadbalancer client loadBalancers functionality
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */
var base = require('../../../core/dns'),
    urlJoin = require('url-join'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    errs = require('errs'),
    _ = require('underscore'),
    lb = pkgcloud.providers.rackspace.loadbalancer;

var _urlPrefix = 'loadbalancers';

module.exports = {

  /**
   * client.getNodes
   * @function
   *
   * @description Get an array of nodes for the provided Load Balancer
 * @memberof rackspace/loadbalancer
   *
   * @param {Object}          loadBalancer      The ID or instance of the Load Balancer
   * @param {function}        callback
   */
  getNodes: function (loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'nodes')
    }, function (err, body, res) {
      if (err) {
        return callback(err);
      }

      else if (!body || !body.nodes) {
        return callback(new Error('Unexpected empty response'));
      }

      else {
        return callback(null, body.nodes.map(function (node) {
          return new lb.Node(self,
            _.extend(node, { loadBalancerId: loadBalancerId }));
        }), res);
      }
    });
  },

  /**
   * client.addNodes
   * @function
   *
   * @description Add a node or array of nodes to the provided Load Balancer. Each of the addresses must be unique to this load balancer.
 * @memberof rackspace/loadbalancer
   *
   * @param {Object}            loadBalancer            The ID or instance of the Load Balancer
   * @param {object[]}          nodes
   * @param {String}            nodes.address           The IP Address for the node
   * @param {String}            nodes.port              The target port on the node
   * @param {String}            nodes.condition         ENABLED, DISABLED, or DRAINING
   * @param {String}            nodes.type              PRIMARY (or SECONDARY for fail over node)
   * @param {Integer}           [nodes.weight]            Algorithm weight for the node
   * @param {function}          callback ( error, nodes )
   */
  addNodes: function(loadBalancer, nodes, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    if (!Array.isArray(nodes)) {
      nodes = [ nodes ];
    }

    var postOptions = {
      path: urlJoin(_urlPrefix, loadBalancerId, 'nodes'),
      method: 'POST',
      body: { nodes: [] }
    };

    postOptions.body.nodes = _.map(nodes, function(node) {
      return _.pick(node, ['address', 'port', 'condition', 'type', 'weight']);
    });

    self._request(postOptions, function (err, body, res) {
      if (err) {
        return callback(err);
      }

      else if (!body || !body.nodes) {
        return callback(new Error('Unexpected empty response'));
      }

      else {
        return callback(null, body.nodes.map(function (node) {
          return new lb.Node(self,
            _.extend(node, { loadBalancerId: loadBalancerId }));
        }), res);
      }
    });
  },

  /**
   * client.updateNode
   * @function
   *
   * @description Update a node condition, type, or weight
 * @memberof rackspace/loadbalancer
   *
   * @param {Object}            loadBalancer           The ID or instance of the Load Balancer
   * @param {Object}            node
   * @param {String}            [node.condition]       ENABLED, DISABLED, or DRAINING
   * @param {String}            [node.type]            PRIMARY (or SECONDARY for fail over node)
   * @param {Integer}           [node.weight]          Algorithm weight for the node
   * @param {function}          callback ( error )
   */
  updateNode: function(loadBalancer, node, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    if (!(node instanceof lb.Node) && (typeof node !== 'object')) {
      throw new Error('node is require argument and must be an object');
    }

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'nodes', node.id),
      method: 'PUT',
      body: {
        node: _.pick(node, ['condition', 'type', 'weight'])
      }
    }, function (err) {
      callback(err);
    });
  },

  /**
   * client.removeNode
   * @function
   *
   * @description Remove a node from a Load Balancer
 * @memberof rackspace/loadbalancer
   *
   * @param {Object}          loadBalancer      The ID or instance of the Load Balancer
   * @param {Object}          node              The ID or instance of the node
   * @param {function}        callback ( error )
   */
  removeNode: function (loadBalancer, node, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer,
        nodeId =
          node instanceof lb.Node ? node.id : node;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'nodes', nodeId),
      method: 'DELETE'
    }, function (err) {
      callback(err);
    });
  },

  /**
   * client.removeNodes
   * @function
   *
   * @description Remove an array of nodes from a Load Balancer
 * @memberof rackspace/loadbalancer
   *
   * @param {object|string}             loadBalancer      The ID or instance of the Load Balancer
   * @param {object[]|string[]}         nodes             An array of IDs or instances of nodes
   * @param {function}                  callback ( error )
   */
  removeNodes: function (loadBalancer, nodes, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    // check for valid inputs
    if (!nodes || nodes.length === 0 || !Array.isArray(nodes)) {
      throw new Error('nodes must be an array of Node or nodeId');
    }

    // support passing either the javascript object or an array of ids
    var list = nodes.map(function (item) {
      return (typeof item === 'object') ? item.id : item;
    });

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'nodes', '?id=' + list.join('&id=')),
      method: 'DELETE'
    }, function (err) {
      callback(err);
    });
  },

  /**
   * client.getNodeServiceEvents
   * @function
   *
   * @description Retrieve a list of events associated with the activity between the node and the Load Balancer
 * @memberof rackspace/loadbalancer
   *
   * @param {Object}          loadBalancer      The ID or instance of the Load Balancer
   * @param {function}        callback ( error, nodeServiceEvents )
   */
  getNodeServiceEvents: function (loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'nodes', 'events')
    }, function (err, body) {
      return err
        ? callback(err)
        : callback(err, body.nodeServiceEvents);
    });
  }
};
