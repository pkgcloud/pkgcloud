/**
 * Created by Ali Bazlamit on 8/31/2017.
 */
var oneandone = require('liboneandone-2'),
  LoadBalancer = require('../loadbalancer').LoadBalancer,
  Node = require('../node').Node;

//
// ### function getNodes (callback)
// #### @callback {function} f(err, nodes).
// Returns a list of the servers/IPs attached to a load balancer.
//
exports.getNodes = function getNodes(loadbalancer, callback) {
  var self = this,
    lbId = loadbalancer instanceof LoadBalancer ? loadbalancer.id : loadbalancer;

  oneandone.listLoadBalancerServerIps(lbId, function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    callback(null, JSON.parse(body).map(function (node) {
      return new Node(self, node);
    }));
  });
};

//
// ### function createNode (serverIps, callback)
// #### @opts {Object}  options
// ####    @loadbalancer     {Loadbalancer} Load balancer name
// ####    @serverIps     {Array}
//
// #### @callback {Function} f(err, node).
//
// Assigns servers/IPs to a load balancer.
//
exports.addNodes = function addNodes(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var self = this;
  var lbId = options.loadbalancer instanceof LoadBalancer ? options.loadbalancer.id : options.loadbalancer;

  var assignData = {
    'server_ips': options.serverIps
  };

  oneandone.assignServerIpToLoadBalancer(lbId, assignData, function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 202) {
      callback(JSON.parse(body));
      return;
    }
    var _lb = JSON.parse(body);
    var lb = new LoadBalancer(self, _lb);
    callback(null, lb);
  });
};

//
// ### function deleteNode(options, callback)
// #### @opts {Object}  options
// ####    @loadbalancer     {Loadbalancer} Load balancer name
// ####    @serverIp     {String}
// #### @callback {Function} f(err, lbId).
//
// Destroy a Node in OAO.
//
exports.removeNode = function removeNode(options, callback) {
  var self = this,
    lbId = options.loadbalancer instanceof LoadBalancer ? options.loadbalancer.id : options.loadbalancer;
  oneandone.unassignServerIpFromLoadBalancer(lbId, options.serverIp, function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 202) {
      callback(JSON.parse(body));
      return;
    }
    var _lb = JSON.parse(body);
    var lb = new LoadBalancer(self, _lb);
    callback(null, lb);
  });
};