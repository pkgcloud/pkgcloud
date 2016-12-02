/*
 * lbaaspools.js: pool operations for lbaas
 *
 * (C) 2015 Hopebay tech
 *
 */

var util = require('util'),
    model = require('../base/model');

var lbaasMembersV2 = exports.lbaasMembersV2 = function (client, details) {
  model.Model.call(this, client, details);
};

util.inherits(lbaasMembersV2, model.Model);

lbaasMembersV2.prototype.create = function (callback) {
  this.client.createMemberv2(this.name, callback);
};

lbaasMembersV2.prototype.refresh = function (callback) {
  this.client.getMemberv2(this.id, callback);
};

lbaasMembersV2.prototype.update = function (callback) {
  this.client.updateMemberv2(this, callback);
};

lbaasMembersV2.prototype.destroy = function (callback) {
  this.client.destroyMemberv2(this.id, callback);
};
