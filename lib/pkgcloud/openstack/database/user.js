/*
 * user.js: Openstack Trove Database User
 *
 * (C) 2014 Hewlett-Packard Development Company, L.P.
 *
 */

var util = require('util'),
    model = require('../../core/base/model');

var User = exports.User = function User(client, details) {
  model.Model.call(this, client, details);
};

util.inherits(User, model.Model);

User.prototype.refresh = function (callback) {
  this.client.getUser(this, callback);
};

User.prototype._setProperties = function (details) {
  this.name = details.name;
  this.password = details.password;
};
