/**
 * Created by Ali Bazlamit on 8/31/2017.
 */

var util = require('util'),
  base = require('../../core/loadbalancer/node');

var Node = exports.Node = function Node(client, details) {
  base.Node.call(this, client, details);
};

util.inherits(Node, base.Node);

Node.prototype._setProperties = function (details) {
  var self = this;

  self.id = details.id;
  self.ip = details.ip;
  self.server_name = details.server_name;
};
