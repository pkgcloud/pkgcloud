/**
 * Created by Ali Bazlamit on 8/31/2017.
 */

var util = require('util'),
  base = require('../../core/loadbalancer/loadbalancer');

var LoadBalancer = exports.LoadBalancer = function LoadBalancer(client, details) {
  base.LoadBalancer.call(this, client, details);
};

util.inherits(LoadBalancer, base.LoadBalancer);

LoadBalancer.prototype._setProperties = function (details) {
  var id = details.id;

  this.id = id;
  this.name = details.name;
  this.ip = details.ip;
  this.healthCheckTest = details.health_check_test;
  this.healthCheckInterval = details.health_check_interval;
  this.persistence = details.persistence;
  this.persistenceTime = details.persistence_time;
  this.datacenter = details.datacenter;
  this.rules = details.rules;
  this.serverIps = details.server_ips;

};
