/*
 * node.js: Base record from which all pkgcloud loadbalancer node models inherit from
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

var util = require('util'),
    model = require('../base/model');

var Node = exports.Node = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(Node, model.Model);
