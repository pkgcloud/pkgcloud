/*
 * network.js: Base router from which all pkgcloud networks inherit.
 *
 * (C) 2015 Hopebaytech
 *
 */

var util = require('util'),
    model = require('../base/model');

var Router = exports.Router = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(Router, model.Model);

Router.prototype.create = function (callback) {
  this.client.createRouter(this.name, callback);
};

Router.prototype.refresh = function (callback) {
  this.client.getRouter(this.id, callback);
};

Router.prototype.update = function (callback) {
  this.client.updateRouter(this, callback);
};

Router.prototype.destroy = function (callback) {
  this.client.destroyRouter(this.id, callback);
};
