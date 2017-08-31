/**
 * Created by Ali Bazlamit on 8/31/2017.
 */
var Rule = function (details) {
  if (!details) {
    throw new Error('Rule must be constructed with at-least basic details.');
  }

  this._setProperties(details);
};

LoadBalancer.prototype._setProperties = function (details) {
  this.id = details.id;
  this.protocol = details.protocol;
  this.portBalancer = details.port_balancer;
  this.portServer = details.port_server;
  this.source = details.source;
};

exports.Rule = Rule;
