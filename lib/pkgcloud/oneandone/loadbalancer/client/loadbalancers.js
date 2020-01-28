/**
 * Created by Ali Bazlamit on 8/31/2017.
 */
var oneandone = require('liboneandone-2'),
  LoadBalancer = require('../loadbalancer').LoadBalancer;

//
// ### function getLoadBalancers (callback)
// #### @callback {function} f(err, loadbalancers). `loadbalancers` is an array that
// represents the loadbalancers that are available to your account
//
// Lists all loadbalancers available to your account.
//
exports.getLoadBalancers = function getLoadBalancers(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var self = this;

  oneandone.listLoadBalancers(function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    callback(null, JSON.parse(body).map(function (loadbalancer) {
      return new LoadBalancer(self, loadbalancer);
    }));
  });
};

//
// ### function createLoadbalancer (options, callback)
// #### @opts {Object}  options
// ####    @name     {String} Load balancer name
// ####    @healthCheckInterval   {int}  Health check period in seconds
// ####    @healthCheckPath   {String} **Optional** flavor to use for this image
// ####    @healthCheckParser   {String} **Optional** flavor to use for this image
// ####    @persistence   {boolean} Persistence
// ####    @persistenceTime   {int} Persistence time in seconds. Required if persistence is enabled.
// ####    @method   {String}  'Balancing procedure','enum': ['ROUND_ROBIN', 'LEAST_CONNECTIONS'].
// ####    @datacenterId   {String} **Optional** ID of the datacenter where the load balancer will be created
// ####    @rules   {Array|Rule} **Optional** flavor to use for this image
// #### @callback {Function} f(err, loadbalancer).
//
// Creates a new load balancer.
//
exports.createLoadBalancer = function createLoadBalancer(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var self = this;

  var balancerData = {
    'name': options.name,
    'description': options.name,
    'health_check_test': oneandone.HealthCheckTestTypes.TCP,
    'health_check_interval': options.healthCheckInterval,
    'health_check_path': options.healthCheckPath,
    'health_check_parser': options.healthCheckParser,
    'persistence': options.Persistence,
    'persistence_time': options.persistenceTime,
    'method': options.method,
    'datacenter_id': options.location,
    'rules': options.rules
  };

  oneandone.createLoadBalancer(balancerData, function (error, response, body) {
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
// ### function deleteLoadBalancer(loadbalancer, callback)
// #### @loadbalancer {LoadBalancer|String} LoadBalancer id or a LoadBalancer
// #### @callback {Function} f(err, lbId).
//
// Destroy a LoadBalancer in OAO.
//
exports.deleteLoadBalancer = function deleteLoadBalancer(loadbalancer, callback) {
  var lbId = loadbalancer instanceof LoadBalancer ? loadbalancer.id : loadbalancer;
  oneandone.deleteLoadBalancer(lbId, function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 202) {
      callback(JSON.parse(body));
      return;
    }
    callback(null, JSON.parse(body));
  });
};

//
// ### function getLoadBalancer(loadbalancer, callback)
// #### @loadbalancer {LoadBalancer|String} LoadBalancer id or a loadbalancer
// #### @callback {Function} f(err, lbId).
//
// Gets a loadbalancer in OAO.
//
exports.getLoadBalancer = function getLoadBalancer(loadbalancer, callback) {
  var self = this,
    lbId = loadbalancer instanceof LoadBalancer ? loadbalancer.id : loadbalancer;

  oneandone.getLoadBalancer(lbId, function (error, response, body) {
      if (error) {
        return callback(error);
      }
      var _lb = JSON.parse(body);
      callback(null, new LoadBalancer(self, _lb));
    }
  );
};

/**
 * client.updateLoadBalancer
 // #### @opts {Object}  options
 // ####    @name     {String} Load balancer name
 // ####    @healthCheckInterval   {int}  Health check period in seconds
 // ####    @healthCheckPath   {String} **Optional** flavor to use for this image
 // ####    @healthCheckParser   {String} **Optional** flavor to use for this image
 // ####    @persistence   {boolean} Persistence
 // ####    @persistenceTime   {int} Persistence time in seconds. Required if persistence is enabled.
 // ####    @method   {String}  'Balancing procedure','enum': ['ROUND_ROBIN', 'LEAST_CONNECTIONS'].
 * @param {function}    callback
 * @returns {*}
 */
exports.updateLoadBalancer = function updateLoadBalancer(options, callback) {
  var self = this,
    lbId = options.loadbalancer instanceof LoadBalancer ? options.loadbalancer.id : options.loadbalancer;

  var updateData = {
    'name': options.name,
    'health_check_test': oneandone.HealthCheckTestTypes.TCP,
    'health_check_interval': options.healthCheckInterval,
    'health_check_path': options.healthCheckPath,
    'health_check_parser': options.healthCheckParser,
    'persistence': options.Persistence,
    'persistence_time': options.persistenceTime,
    'method': options.method,
    'rules': options.rules
  };
  oneandone.updateLoadBalancer(lbId, updateData, function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 202) {
      callback(JSON.parse(body));
      return;
    }
    var lb = JSON.parse(body);
    callback(null, new LoadBalancer(self, lb));
  });
};


