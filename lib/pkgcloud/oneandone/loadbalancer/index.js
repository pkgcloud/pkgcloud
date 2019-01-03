/**
 * Created by Ali Bazlamit on 8/31/2017.
 */

exports.Client = require('./client').Client;
exports.LoadBalancer = require('./loadbalancer').LoadBalancer;
exports.Node = require('./node').Node;

exports.createClient = function (options) {
  return new exports.Client(options);
};
